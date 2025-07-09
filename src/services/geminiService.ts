
import { GoogleGenerativeAI } from '@google/generative-ai';

interface UserProfile {
  name: string;
  knowsCNV: boolean;
  answers: string[];
}

interface Scenario {
  situation: string;
  options: {
    passive: string;
    cnv: string;
    neutral: string;
    problematic: string;
  };
}

interface FeedbackResponse {
  immediate: string;
  detailed: string;
  points: number;
}

let genAI: GoogleGenerativeAI | null = null;

export const initializeGemini = (apiKey: string) => {
  genAI = new GoogleGenerativeAI(apiKey);
};

export const generateScenarios = async (userProfile: UserProfile): Promise<Scenario[]> => {
  if (!genAI) throw new Error('Gemini não inicializado');

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `
Como especialista em Comunicação Não Violenta (CNV), crie EXATAMENTE 10 cenários do COTIDIANO CORPORATIVO personalizados para ${userProfile.name}.

Perfil do usuário:
- Nome: ${userProfile.name}
- Conhece CNV: ${userProfile.knowsCNV ? 'Sim' : 'Não'}
- Respostas do questionário: ${userProfile.answers.join(', ')}

IMPORTANTE: Crie situações do DIA A DIA no AMBIENTE CORPORATIVO (reuniões, conversas com colegas, feedbacks, conflitos no trabalho, comunicação com chefe, etc).

Para cada cenário, forneça:
1. Uma situação corporativa cotidiana específica e realista
2. Exatamente 4 opções de resposta com TAMANHO SIMILAR (máximo 2 linhas cada):
   - PASSIVA: Evita o conflito, não resolve (máximo 2 linhas)
   - CNV: Aplica CNV de forma CONCISA (máximo 2 linhas)
   - NEUTRA: Resposta comum mas não resolve (máximo 2 linhas)  
   - PROBLEMÁTICA: Resposta conflituosa (máximo 2 linhas)

TODAS as respostas devem ter tamanho similar, ser concisas e SEM caracteres especiais como asteriscos, aspas duplas ou simples.

Responda em JSON válido no formato:
{
  "scenarios": [
    {
      "situation": "descrição da situação corporativa cotidiana",
      "options": {
        "passive": "resposta passiva concisa",
        "cnv": "resposta CNV concisa",
        "neutral": "resposta neutra concisa",
        "problematic": "resposta problemática concisa"
      }
    }
  ]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Formato de resposta inválido');
    
    const data = JSON.parse(jsonMatch[0]);
    return data.scenarios || [];
  } catch (error) {
    console.error('Erro ao gerar cenários:', error);
    throw new Error('Falha ao gerar cenários personalizados');
  }
};

export const generateFeedback = async (
  scenario: string,
  chosenOption: string,
  optionType: 'passive' | 'cnv' | 'neutral' | 'problematic',
  userName: string
): Promise<FeedbackResponse> => {
  if (!genAI) throw new Error('Gemini não inicializado');

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const pointsMap = {
    cnv: 10,
    neutral: 5,
    passive: 3,
    problematic: 0
  };

  const prompt = `
Como especialista em CNV, analise a escolha de ${userName} no seguinte cenário:

CENÁRIO: ${scenario}
RESPOSTA ESCOLHIDA: ${chosenOption}
TIPO DA RESPOSTA: ${optionType}

Forneça feedback em JSON:
{
  "immediate": "feedback imediato curto e personalizado usando o nome ${userName}",
  "detailed": "explicação detalhada sobre por que a opção CNV seria ideal, mencionando os princípios da CNV aplicados",
  "points": ${pointsMap[optionType]}
}

O feedback deve ser construtivo, educativo, motivador e SEM caracteres especiais como asteriscos, aspas duplas ou simples. Use linguagem natural e humana.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Formato de resposta inválido');
    
    const data = JSON.parse(jsonMatch[0]);
    return {
      immediate: data.immediate?.replace(/[*"']/g, ''),
      detailed: data.detailed?.replace(/[*"']/g, ''),
      points: pointsMap[optionType]
    };
  } catch (error) {
    console.error('Erro ao gerar feedback:', error);
    throw new Error('Falha ao gerar feedback');
  }
};

export const generateFinalFeedback = async (
  userName: string,
  totalScore: number,
  totalQuestions: number,
  answerCategories: { cnv: number; neutral: number; passive: number; problematic: number }
): Promise<string> => {
  if (!genAI) throw new Error('Gemini não inicializado');

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const percentage = (totalScore / (totalQuestions * 10)) * 100;

  const prompt = `
Crie um feedback final personalizado para ${userName} sobre seu desempenho no treinamento de CNV.

PONTUAÇÃO: ${totalScore} de ${totalQuestions * 10} pontos possíveis (${percentage.toFixed(1)}%)
DISTRIBUIÇÃO DAS RESPOSTAS:
- Respostas CNV: ${answerCategories.cnv} de ${totalQuestions}
- Respostas Neutras: ${answerCategories.neutral} de ${totalQuestions}
- Respostas Passivas: ${answerCategories.passive} de ${totalQuestions}
- Respostas Problemáticas: ${answerCategories.problematic} de ${totalQuestions}

Instruções para o feedback:
1. Use o nome ${userName} de forma personalizada
2. Seja motivador e construtivo
3. Destaque pontos fortes baseados no desempenho
4. Sugira áreas específicas de melhoria
5. Relacione os resultados com benefícios no ambiente corporativo
6. Use tom profissional mas acolhedor
7. Remova completamente asteriscos, aspas duplas ou simples
8. Use linguagem natural e conversacional
9. Máximo 250 palavras
10. Termine com uma mensagem motivadora

Escreva apenas o texto do feedback, sem formatação especial.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Remove caracteres especiais e formatação
    text = text.replace(/[*"'`#]/g, '');
    text = text.replace(/\*\*/g, '');
    text = text.replace(/\n\s*\n/g, '\n');
    text = text.trim();
    
    return text;
  } catch (error) {
    console.error('Erro ao gerar feedback final:', error);
    
    // Fallback em caso de erro
    let fallbackMessage = `Parabéns, ${userName}! `;
    
    if (percentage >= 80) {
      fallbackMessage += `Você teve um excelente desempenho com ${totalScore} pontos! Demonstrou forte domínio dos princípios de CNV.`;
    } else if (percentage >= 60) {
      fallbackMessage += `Você teve um bom desempenho com ${totalScore} pontos! Está no caminho certo para dominar a CNV.`;
    } else if (percentage >= 40) {
      fallbackMessage += `Você fez um bom esforço com ${totalScore} pontos! Há espaço para crescimento na aplicação da CNV.`;
    } else {
      fallbackMessage += `Você completou o treinamento com ${totalScore} pontos! Este é apenas o início da sua jornada de aprendizado em CNV.`;
    }
    
    fallbackMessage += ` Continue praticando essas habilidades no seu dia a dia corporativo. A Comunicação Não Violenta é uma ferramenta poderosa para melhorar relacionamentos e aumentar a produtividade no trabalho. Parabéns por investir no seu desenvolvimento pessoal e profissional!`;
    
    return fallbackMessage;
  }
};
