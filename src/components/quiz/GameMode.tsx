
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Target, Brain, Loader2 } from 'lucide-react';
import { UserProfile, GameState } from '../QuizContainer';
import { initializeGemini, generateScenarios, generateFeedback } from '@/services/geminiService';
import { useToast } from '@/hooks/use-toast';

interface GameModeProps {
  userProfile: UserProfile;
  apiKey: string;
  onComplete: (finalGameState: GameState) => void;
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

const GameMode: React.FC<GameModeProps> = ({ userProfile, apiKey, onComplete }) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [detailedFeedback, setDetailedFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [answers, setAnswers] = useState<Array<{
    scenario: string;
    chosen: string;
    feedback: string;
    points: number;
  }>>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    const loadScenarios = async () => {
      try {
        setIsLoading(true);
        initializeGemini(apiKey);
        const generatedScenarios = await generateScenarios(userProfile);
        setScenarios(generatedScenarios);
      } catch (error) {
        console.error('Erro ao carregar cenários:', error);
        toast({
          title: "Erro ao carregar cenários",
          description: "Houve um problema ao gerar os cenários personalizados.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (apiKey && userProfile.name) {
      loadScenarios();
    }
  }, [apiKey, userProfile, toast]);

  const handleAnswerSelect = async (answerIndex: number) => {
    if (isGeneratingFeedback) return;
    
    setSelectedAnswer(answerIndex);
    setIsGeneratingFeedback(true);
    
    try {
      const currentScenario = scenarios[currentQuestion];
      const optionTypes = ['passive', 'cnv', 'neutral', 'problematic'] as const;
      const chosenType = optionTypes[answerIndex];
      const chosenOption = Object.values(currentScenario.options)[answerIndex];
      
      const feedbackResponse = await generateFeedback(
        currentScenario.situation,
        chosenOption,
        chosenType,
        userProfile.name
      );
      
      setScore(prev => prev + feedbackResponse.points);
      setFeedback(feedbackResponse.immediate);
      setDetailedFeedback(feedbackResponse.detailed);
      setShowFeedback(true);
      
      // Store answer
      setAnswers(prev => [...prev, {
        scenario: currentScenario.situation,
        chosen: chosenOption,
        feedback: feedbackResponse.immediate,
        points: feedbackResponse.points
      }]);
    } catch (error) {
      console.error('Erro ao gerar feedback:', error);
      toast({
        title: "Erro ao gerar feedback",
        description: "Houve um problema ao processar sua resposta.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);
    setFeedback('');
    setDetailedFeedback('');
    
    if (currentQuestion < scenarios.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Game completed
      onComplete({
        currentQuestion: currentQuestion + 1,
        score,
        answers
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-semibold mb-2">Gerando cenários personalizados...</h3>
          <p className="text-muted-foreground">
            Nossa IA está criando situações específicas para seu perfil
          </p>
        </div>
      </div>
    );
  }

  if (scenarios.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-xl font-semibold mb-2">Erro ao carregar cenários</h3>
          <p className="text-muted-foreground">
            Não foi possível gerar os cenários personalizados
          </p>
        </div>
      </div>
    );
  }

  const currentScenario = scenarios[currentQuestion];
  const isLastQuestion = currentQuestion === scenarios.length - 1;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card-glass">
        {!showFeedback ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-accent" />
                <span className="text-lg font-medium">
                  Pergunta {currentQuestion + 1} de {scenarios.length}
                </span>
              </div>
              <div className="score-display">
                {score} pontos
              </div>
            </div>

            {/* Scenario */}
            <div className="card-glass mb-8">
              <h3 className="text-xl font-semibold mb-4 text-accent">Situação:</h3>
              <p className="text-lg leading-relaxed">{currentScenario.situation}</p>
            </div>

            {/* Options */}
            <div className="space-y-4 mb-8">
              {Object.values(currentScenario.options).map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`w-full p-4 h-auto text-left justify-start hover:bg-primary/20 hover:border-primary/50 hover:scale-[1.02] hover:text-white transition-all duration-300 whitespace-normal break-words ${
                    selectedAnswer === index ? 'bg-primary/20 border-primary' : ''
                  } ${isGeneratingFeedback ? 'opacity-50' : ''}`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showFeedback || isGeneratingFeedback}
                >
                  <div className="flex items-start gap-2 w-full">
                    {isGeneratingFeedback && selectedAnswer === index && (
                      <Loader2 className="w-4 h-4 animate-spin mt-0.5 flex-shrink-0" />
                    )}
                    <span className="text-sm leading-relaxed text-left flex-1 break-words">{option}</span>
                  </div>
                </Button>
              ))}
            </div>
          </>
        ) : (
          /* Feedback */
          <div className="card-glass bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <div className="flex items-start gap-4">
              <Brain className="w-6 h-6 text-accent mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold mb-2 text-accent">Feedback Imediato:</h4>
                <p className="text-base leading-relaxed mb-4">{feedback}</p>
                
                {detailedFeedback && (
                  <div className="mb-4 p-4 bg-muted/20 rounded-lg">
                    <h5 className="font-medium mb-2 text-secondary">Análise Detalhada:</h5>
                    <p className="text-sm leading-relaxed text-muted-foreground">{detailedFeedback}</p>
                  </div>
                )}
                
                <Button 
                  onClick={handleNextQuestion}
                  className="btn-hero"
                >
                  {isLastQuestion ? 'Ver Resultados' : 'Próxima Pergunta'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameMode;
