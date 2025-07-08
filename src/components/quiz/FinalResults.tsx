import React from 'react';
import { Trophy, Star, RotateCcw, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserProfile, GameState } from '../QuizContainer';

interface FinalResultsProps {
  userProfile: UserProfile;
  gameState: GameState;
  onRestart: () => void;
}

const FinalResults: React.FC<FinalResultsProps> = ({ 
  userProfile, 
  gameState, 
  onRestart 
}) => {
  const maxScore = 100; // 10 cenários × 10 pontos
  const percentage = (gameState.score / maxScore) * 100;

  const getPerformanceLevel = (): { 
    level: string; 
    color: string; 
    description: string; 
    recommendations: string[];
  } => {
    if (percentage >= 80) {
      return {
        level: 'Expert em CNV',
        color: 'text-success',
        description: `Parabéns, ${userProfile.name}! Você demonstrou excelente domínio dos princípios da CNV.`,
        recommendations: [
          'Continue praticando em situações do dia a dia',
          'Considere compartilhar seu conhecimento com colegas',
          'Explore técnicas avançadas de mediação'
        ]
      };
    } else if (percentage >= 60) {
      return {
        level: 'Praticante Avançado',
        color: 'text-primary',
        description: `Muito bem, ${userProfile.name}! Você tem uma boa compreensão da CNV e está no caminho certo.`,
        recommendations: [
          'Pratique mais a identificação de necessidades',
          'Trabalhe na expressão de sentimentos',
          'Continue aplicando no ambiente profissional'
        ]
      };
    } else if (percentage >= 40) {
      return {
        level: 'Iniciante Promissor',
        color: 'text-warning',
        description: `${userProfile.name}, você está começando bem! Há um bom potencial para crescimento.`,
        recommendations: [
          'Estude os 4 componentes da CNV',
          'Pratique observação sem julgamento',
          'Comece aplicando em situações simples'
        ]
      };
    } else {
      return {
        level: 'Explorador CNV',
        color: 'text-muted-foreground',
        description: `${userProfile.name}, toda jornada começa com o primeiro passo! Você tem muito a descobrir.`,
        recommendations: [
          'Leia sobre os fundamentos da CNV',
          'Comece praticando autoconexão',
          'Observe padrões de comunicação no dia a dia'
        ]
      };
    }
  };

  const performance = getPerformanceLevel();

  const cnvAnswers = gameState.answers.filter(answer => answer.points === 10).length;
  const neutralAnswers = gameState.answers.filter(answer => answer.points === 5).length;
  const passiveAnswers = gameState.answers.filter(answer => answer.points === 2).length;
  const problematicAnswers = gameState.answers.filter(answer => answer.points === 0).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      {/* Header com score principal */}
      <div className="card-glass text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold mb-2">
          Parabéns, <span className="text-accent">{userProfile.name}</span>!
        </h2>
        
        <div className="text-6xl font-bold mb-4">
          <span className={performance.color}>{gameState.score}</span>
          <span className="text-2xl text-muted-foreground">/{maxScore}</span>
        </div>
        
        <div className="text-xl font-semibold mb-4">
          <span className={performance.color}>{performance.level}</span>
        </div>
        
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          {performance.description}
        </p>

        {/* Barra de progresso circular visual */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke={`hsl(var(--${percentage >= 80 ? 'success' : percentage >= 60 ? 'primary' : percentage >= 40 ? 'warning' : 'muted-foreground'}))`}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(percentage / 100) * 314} 314`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{Math.round(percentage)}%</span>
          </div>
        </div>
      </div>

      {/* Análise detalhada */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribuição de respostas */}
        <div className="card-glass">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-accent" />
            Análise de Respostas
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-success">Abordagem CNV</span>
              <span className="font-bold">{cnvAnswers} respostas</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-warning">Neutras</span>
              <span className="font-bold">{neutralAnswers} respostas</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Passivas</span>
              <span className="font-bold">{passiveAnswers} respostas</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-destructive">Problemáticas</span>
              <span className="font-bold">{problematicAnswers} respostas</span>
            </div>
          </div>
        </div>

        {/* Recomendações */}
        <div className="card-glass">
          <h3 className="text-xl font-bold mb-4">
            Próximos Passos
          </h3>
          
          <ul className="space-y-2">
            {performance.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span className="text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Revisão de cenários (opcional) */}
      <div className="card-glass">
        <h3 className="text-xl font-bold mb-4">Revisão dos Cenários</h3>
        <div className="space-y-4 max-h-60 overflow-y-auto">
          {gameState.answers.map((answer, index) => (
            <div key={index} className="border-l-4 border-primary pl-4 py-2">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-sm">{answer.scenario}</h4>
                <span className="text-sm font-bold">+{answer.points}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {answer.feedback}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Ações finais */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={onRestart} className="btn-hero flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          Tentar Novamente
        </Button>
        
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Meu resultado CNV',
                text: `Consegui ${gameState.score} pontos no teste de CNV! ${performance.level}`,
                url: window.location.href
              });
            }
          }}
        >
          <Share className="w-4 h-4" />
          Compartilhar Resultado
        </Button>
      </div>
    </div>
  );
};

export default FinalResults;