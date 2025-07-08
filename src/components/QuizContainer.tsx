import React, { useState } from 'react';
import NameInput from './quiz/NameInput';
import InitialQuestion from './quiz/InitialQuestion';
import QuestionnaireFlow from './quiz/QuestionnaireFlow';
import GameMode from './quiz/GameMode';
import FinalResults from './quiz/FinalResults';

export interface UserProfile {
  name: string;
  knowsCNV: boolean;
  answers: string[];
}

export interface GameState {
  currentQuestion: number;
  score: number;
  answers: Array<{
    scenario: string;
    chosen: string;
    feedback: string;
    points: number;
  }>;
}

type QuizStep = 'name' | 'initial' | 'questionnaire' | 'game' | 'results';

const QuizContainer: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<QuizStep>('name');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    knowsCNV: false,
    answers: []
  });
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    score: 0,
    answers: []
  });

  const handleNameSubmit = (name: string) => {
    setUserProfile(prev => ({ ...prev, name }));
    setCurrentStep('initial');
  };

  const handleInitialAnswer = (knowsCNV: boolean) => {
    setUserProfile(prev => ({ ...prev, knowsCNV }));
    setCurrentStep('questionnaire');
  };

  const handleQuestionnaireComplete = (answers: string[]) => {
    setUserProfile(prev => ({ ...prev, answers }));
    setCurrentStep('game');
  };

  const handleGameComplete = (finalGameState: GameState) => {
    setGameState(finalGameState);
    setCurrentStep('results');
  };

  const resetQuiz = () => {
    setCurrentStep('name');
    setUserProfile({ name: '', knowsCNV: false, answers: [] });
    setGameState({ currentQuestion: 0, score: 0, answers: [] });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'name':
        return <NameInput onSubmit={handleNameSubmit} />;
      
      case 'initial':
        return (
          <InitialQuestion 
            userName={userProfile.name}
            onAnswer={handleInitialAnswer} 
          />
        );
      
      case 'questionnaire':
        return (
          <QuestionnaireFlow
            userName={userProfile.name}
            knowsCNV={userProfile.knowsCNV}
            onComplete={handleQuestionnaireComplete}
          />
        );
      
      case 'game':
        return (
          <GameMode
            userProfile={userProfile}
            onComplete={handleGameComplete}
          />
        );
      
      case 'results':
        return (
          <FinalResults
            userProfile={userProfile}
            gameState={gameState}
            onRestart={resetQuiz}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        {renderStep()}
      </div>
    </div>
  );
};

export default QuizContainer;