import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps = [
    {
      title: "Welcome to HDI",
      subtitle: "Houston Development Intelligence",
      description: "The next generation of real estate intelligence",
      icon: "🏠"
    },
    {
      title: "AI-Powered Analytics",
      subtitle: "1.77M Properties • Real-time Data",
      description: "Advanced algorithms analyzing Houston's entire property market",
      icon: "🧠"
    },
    {
      title: "Interactive Visualization",
      subtitle: "Next-Gen Interface",
      description: "Experience properties like never before with our intelligent grid system",
      icon: "✨"
    }
  ];

  useEffect(() => {
    const timers = [
      setTimeout(() => setCurrentStep(1), 2000),
      setTimeout(() => setCurrentStep(2), 4000),
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 800);
      }, 6000)
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed inset-0 z-50 bg-gradient-to-br from-hdi-bg-primary via-hdi-bg-secondary to-hdi-bg-primary flex items-center justify-center"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-hdi-accent-cyan/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-hdi-accent-teal/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-hdi-accent-cyan/5 to-hdi-accent-teal/5 rounded-full blur-3xl animate-spin-slow"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 gap-4 h-full w-full p-8">
            {Array.from({ length: 144 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: i * 0.01, duration: 0.5 }}
                className="border border-hdi-accent-cyan/20 rounded"
              />
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center max-w-2xl mx-auto px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-8"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="text-8xl mb-6"
              >
                {steps[currentStep].icon}
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-6xl font-bold bg-gradient-to-r from-hdi-accent-cyan via-hdi-text-primary to-hdi-accent-teal bg-clip-text text-transparent leading-tight"
              >
                {steps[currentStep].title}
              </motion.h1>

              {/* Subtitle */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="text-2xl font-medium text-hdi-accent-cyan tracking-wide"
              >
                {steps[currentStep].subtitle}
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="text-lg text-hdi-text-secondary leading-relaxed max-w-xl mx-auto"
              >
                {steps[currentStep].description}
              </motion.p>

              {/* Technology Indicators */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                  className="flex items-center justify-center gap-8 text-hdi-text-secondary text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-hdi-accent-teal rounded-full animate-pulse"></div>
                    <span>PostgreSQL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-hdi-accent-cyan rounded-full animate-pulse delay-200"></div>
                    <span>Perplexity AI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-500"></div>
                    <span>Railway Cloud</span>
                  </div>
                </motion.div>
              )}

              {/* Interactive Elements */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                  className="flex items-center justify-center gap-6"
                >
                  <div className="w-4 h-4 bg-hdi-accent-cyan rounded-sm animate-bounce"></div>
                  <div className="w-6 h-4 bg-blue-500 rounded-sm animate-bounce delay-200"></div>
                  <div className="w-5 h-5 bg-hdi-accent-teal rounded-full animate-bounce delay-500"></div>
                  <div className="text-hdi-text-secondary text-sm">Interactive Property Shapes</div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Progress Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="flex items-center justify-center gap-3 mt-12"
          >
            {steps.map((_, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.5 + index * 0.1 }}
                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  index === currentStep
                    ? 'bg-hdi-accent-cyan scale-125'
                    : index < currentStep
                    ? 'bg-hdi-accent-teal'
                    : 'bg-hdi-text-secondary/30'
                }`}
              />
            ))}
          </motion.div>

          {/* Skip Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            onClick={() => {
              setIsVisible(false);
              setTimeout(onComplete, 300);
            }}
            className="absolute bottom-8 right-8 text-hdi-text-secondary hover:text-hdi-accent-cyan transition-colors duration-300 text-sm"
          >
            Skip Introduction →
          </motion.button>
        </div>

        {/* Powered By */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="absolute bottom-8 left-8 text-xs text-hdi-text-secondary/70"
        >
          Powered by Next-Generation AI
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};