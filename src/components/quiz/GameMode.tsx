import React, { useState, useEffect } from 'react';
import { Trophy, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserProfile, GameState } from '../QuizContainer';

interface GameModeProps {
  userProfile: UserProfile;
  onComplete: (gameState: GameState) => void;
}

interface Scenario {
  id: number;
  situation: string;
  context: string;
  options: {
    passive: string;
    cnv: string;
    neutral: string;
    problematic: string;
  };
  correctAnswer: 'cnv';
}

const GameMode: React.FC<GameModeProps> = ({ userProfile, onComplete }) => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [score, setScore] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<Array<{
    scenario: string;
    chosen: string;
    feedback: string;
    points: number;
  }>>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  // Mock scenarios - Em produção, estes viriam da API Gemini
  const generateMockScenarios = (): Scenario[] => {
    const baseScenarios: Scenario[] = [
      {
        id: 1,
        situation: "Conflito em Reunião de Equipe",
        context: `Durante uma reunião, um colega interrompe você constantemente e desconsidera suas ideias. Outros membros da equipe começam a ficar desconfortáveis com a situação.`,
        options: {
          passive: "Fico quieto(a) e deixo passar para evitar mais conflito",
          cnv: "Digo: 'Quando sou interrompido(a), sinto-me desrespeitado(a) e preciso que cada um tenha seu tempo para falar. Podemos estabelecer uma ordem?'",
          neutral: "Espero a reunião acabar e converso com o gestor depois",
          problematic: "Interrompo de volta dizendo: 'Você está sendo muito inconveniente, me deixe falar!'"
        },
        correctAnswer: 'cnv'
      },
      {
        id: 2,
        situation: "Feedback Difícil para Subordinado",
        context: `Um colaborador da sua equipe tem apresentado baixo desempenho e isso está afetando os resultados do time. Você precisa dar um feedback.`,
        options: {
          passive: "Evito o assunto e espero que ele melhore sozinho",
          cnv: "'Observei que nas últimas semanas algumas entregas ficaram pendentes. Estou preocupado(a) com o time e preciso entender como posso te apoiar.'",
          neutral: "Mando um email formal sobre os problemas de performance",
          problematic: "Falo diretamente: 'Seu trabalho está péssimo, precisa melhorar urgente ou teremos problemas'"
        },
        correctAnswer: 'cnv'
      }
    ];

    return baseScenarios;
  };

  useEffect(() => {
    // Simula carregamento da API
    setTimeout(() => {
      setScenarios(generateMockScenarios());
      setIsLoading(false);
    }, 1500);
  }, []);

  const getAnswerType = (answer: string): string => {
    const scenario = scenarios[currentScenario];
    if (answer === scenario.options.cnv) return 'cnv';
    if (answer === scenario.options.passive) return 'passive';
    if (answer === scenario.options.neutral) return 'neutral';
    return 'problematic';
  };

  const getPoints = (answerType: string): number => {
    switch (answerType) {
      case 'cnv': return 10;
      case 'neutral': return 5;
      case 'passive': return 2;
      case 'problematic': return 0;
      default: return 0;
    }
  };

  const getFeedback = (answerType: string): string => {
    const feedbacks = {
      cnv: `Excelente, ${userProfile.name}! Você aplicou os princípios da CNV de forma clara: observação sem julgamento, expressão de sentimentos e necessidades, e um pedido específico.`,
      neutral: `Boa tentativa, ${userProfile.name}. Sua abordagem evita conflito, mas pode ser mais efetiva se você expressar seus sentimentos e necessidades diretamente.`,
      passive: `${userProfile.name}, entendo o desejo de evitar conflito, mas essa abordagem pode perpetuar o problema. Tente expressar suas necessidades de forma respeitosa.`,
      problematic: `${userProfile.name}, essa abordagem pode escalar o conflito. Em CNV, focamos em observações e necessidades ao invés de julgamentos e críticas.`
    };
    return feedbacks[answerType as keyof typeof feedbacks];
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    const answerType = getAnswerType(answer);
    const points = getPoints(answerType);
    const feedback = getFeedback(answerType);

    setScore(score + points);
    setGameAnswers([...gameAnswers, {
      scenario: scenarios[currentScenario].situation,
      chosen: answer,
      feedback,
      points
    }]);

    setShowFeedback(true);
  };

  const handleNextScenario = () => {
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(currentScenario + 1);
      setShowFeedback(false);
      setSelectedAnswer('');
    } else {
      // Fim do jogo
      onComplete({
        currentQuestion: currentScenario + 1,
        score,
        answers: gameAnswers
      });
    }
  };

  if (isLoading) {
    return (
      <div className="card-glass max-w-2xl mx-auto text-center animate-slide-up">
        <div className="animate-pulse">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold mb-4">
            Preparando seus cenários, {userProfile.name}...
          </h2>
          <p className="text-muted-foreground">
            Nossa IA está criando situações personalizadas baseadas no seu perfil
          </p>
        </div>
      </div>
    );
  }

  const scenario = scenarios[currentScenario];
  const answerType = selectedAnswer ? getAnswerType(selectedAnswer) : '';

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      {/* Header com score */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Cenário {currentScenario + 1}/10</h2>
          <p className="text-muted-foreground">
            Olá, <span className="text-accent">{userProfile.name}</span>
          </p>
        </div>
        <div className="score-display flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          <span>{score} pontos</span>
        </div>
      </div>

      {!showFeedback ? (
        /* Cenário e opções */
        <div className="card-glass">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-primary mb-3">
              {scenario.situation}
            </h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-foreground leading-relaxed">
                {scenario.context}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-medium mb-4">Como você reagiria nesta situação?</p>
            
            {Object.entries(scenario.options).map(([type, option]) => (
              <button
                key={type}
                onClick={() => handleAnswerSelect(option)}
                className="w-full text-left p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group"
              >
                <p className="font-medium group-hover:text-primary transition-colors">
                  {option}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Feedback */
        <div className="space-y-6">
          <div className="card-glass">
            <div className="text-center mb-6">
              {answerType === 'cnv' && (
                <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              )}
              {answerType === 'neutral' && (
                <AlertCircle className="w-16 h-16 text-warning mx-auto mb-4" />
              )}
              {(answerType === 'passive' || answerType === 'problematic') && (
                <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              )}
              
              <h3 className="text-xl font-bold mb-2">
                +{getPoints(answerType)} pontos
              </h3>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <p className="text-foreground leading-relaxed">
                {getFeedback(answerType)}
              </p>
            </div>

            {answerType !== 'cnv' && (
              <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                <h4 className="font-semibold text-success mb-2">
                  💡 A abordagem CNV ideal seria:
                </h4>
                <p className="text-foreground">
                  {scenario.options.cnv}
                </p>
              </div>
            )}
          </div>

          <div className="text-center">
            <Button onClick={handleNextScenario} className="btn-hero">
              {currentScenario < scenarios.length - 1 ? 'Próximo Cenário' : 'Ver Resultado Final'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameMode;