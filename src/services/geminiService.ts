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
Crie um feedback final personalizado para ${userName} sobre seu desempenho no treinamento de CNV:

PONTUAÇÃO: ${totalScore}/${totalQuestions * 10} (${percentage.toFixed(1)}%)
DISTRIBUIÇÃO DAS RESPOSTAS:
- CNV: ${answerCategories.cnv}
- Neutras: ${answerCategories.neutral}  
- Passivas: ${answerCategories.passive}
- Problemáticas: ${answerCategories.problematic}

O feedback deve:
1. Usar o nome ${userName}
2. Ser motivador e construtivo
3. Destacar pontos fortes
4. Sugerir áreas de melhoria
5. Relacionar com produtividade no trabalho
6. Ter tom profissional mas acolhedor
7. SEM caracteres especiais como asteriscos, aspas duplas ou simples
8. Usar linguagem natural e humana

Máximo 300 palavras.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text.replace(/[*"']/g, '');
  } catch (error) {
    console.error('Erro ao gerar feedback final:', error);
    throw new Error('Falha ao gerar feedback final');
  }
};