import React, { createContext, useContext, useState, useEffect } from 'react';

const AIActivationContext = createContext();

export const AIActivationProvider = ({ children, viewerCount = 0 }) => {
  const [isAIActive, setIsAIActive] = useState(false);

  useEffect(() => {
    // GLOBAL ACTIVATION RULE: AI only activates when audience ≥ 1
    setIsAIActive(viewerCount >= 1);
  }, [viewerCount]);

  return (
    <AIActivationContext.Provider value={{ isAIActive, viewerCount }}>
      {children}
    </AIActivationContext.Provider>
  );
};

export const useAIActivation = () => {
  const context = useContext(AIActivationContext);
  if (!context) {
    throw new Error('useAIActivation must be used within AIActivationProvider');
  }
  return context;
};