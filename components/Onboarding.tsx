import React, { useState, useEffect } from 'react';
import { Sparkles, Edit3, Share2, ArrowRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    icon: <Edit3 size={64} className="text-white" />,
    title: "Diseña tu Inspiración",
    description: "Personaliza versículos con herramientas simples. Elige tipografías y estilos únicos."
  },
  {
    icon: <Sparkles size={64} className="text-white" />,
    title: "Poder de IA",
    description: "Genera fondos y gradientes exclusivos automáticamente para resaltar tus palabras."
  },
  {
    icon: <Share2 size={64} className="text-white" />,
    title: "Libertad Total",
    description: "Tus creaciones son tuyas. Úsalas libremente en TikTok, YouTube, Instagram y más."
  }
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => {
        if (prev < SLIDES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 4000); // 4 seconds per slide

    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md w-full">
        
        {/* Slide Content */}
        <div className="min-h-[300px] flex flex-col items-center justify-center space-y-8">
            <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-4 animate-bounce">
                {SLIDES[currentSlide].icon}
            </div>
            
            <div className="space-y-4">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                    {SLIDES[currentSlide].title}
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed">
                    {SLIDES[currentSlide].description}
                </p>
            </div>
        </div>

        {/* Indicators */}
        <div className="flex gap-2 mt-8">
          {SLIDES.map((_, idx) => (
            <div 
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/20'}`}
            />
          ))}
        </div>
      </div>

      {/* Button */}
      <div className="w-full max-w-xs mb-10">
        <button 
          onClick={handleNext}
          className="w-full py-4 bg-white text-black rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
        >
          {currentSlide === SLIDES.length - 1 ? 'Comenzar' : 'Siguiente'}
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};