import React, { useState, useEffect, useRef } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { User } from '../types';
import { Loader2, ArrowRight, Camera, Sparkles, Edit3, Share2, Check } from 'lucide-react';

interface AuthProps {
  onLoginSuccess: (user: User) => void;
}

const PasskeyIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="currentColor" height="24" width="24">
        <path d="M4.5 20c-0.4125 0 -0.765585 -0.1469 -1.05925 -0.44075C3.146915 19.2656 3 18.9125 3 18.5v-0.85c0 -0.63335 0.158335 -1.175 0.475 -1.625 0.316665 -0.45 0.725 -0.79165 1.225 -1.025 1.11665 -0.5 2.1875 -0.875 3.2125 -1.125S9.96665 13.5 11 13.5c0.35 0 0.7 0.0125 1.05 0.0375 0.35 0.025 0.7 0.07085 1.05 0.1375 0.13335 0.03335 0.23335 0.09325 0.3 0.17975 0.06665 0.0865 0.1 0.19325 0.1 0.32025 0 0.83335 0.19165 1.6125 0.575 2.3375 0.38335 0.725 0.91665 1.32085 1.6 1.7875 0.10115 0.06615 0.1806 0.14875 0.23825 0.24775 0.05785 0.09915 0.08675 0.20825 0.08675 0.32725v0.375c0 0.2125 -0.07185 0.3906 -0.2155 0.53425 -0.14385 0.14385 -0.322 0.21575 -0.5345 0.21575H4.5Zm6.5 -8.5c-1.05 0 -1.9375 -0.3625 -2.6625 -1.0875 -0.725 -0.725 -1.0875 -1.6125 -1.0875 -2.6625s0.3625 -1.9375 1.0875 -2.6625C9.0625 4.3625 9.95 4 11 4s1.9375 0.3625 2.6625 1.0875c0.725 0.725 1.0875 1.6125 1.0875 2.6625s-0.3625 1.9375 -1.0875 2.6625C12.9375 11.1375 12.05 11.5 11 11.5Zm7.5 3.175c0.28335 0 0.52085 -0.09585 0.7125 -0.2875S19.5 13.95835 19.5 13.675c0 -0.28335 -0.09585 -0.52085 -0.2875 -0.7125s-0.42915 -0.2875 -0.7125 -0.2875c-0.28335 0 -0.52085 0.09585 -0.7125 0.2875S17.5 13.39165 17.5 13.675c0 0.28335 0.09585 0.52085 0.2875 0.7125s0.42915 0.2875 0.7125 0.2875Zm0.225 8.725 -1.119 -1.119c-0.03735 -0.03735 -0.07265 -0.12265 -0.106 -0.256v-4.4965c-0.73335 -0.219 -1.33335 -0.63265 -1.8 -1.241 -0.46665 -0.60835 -0.7 -1.3125 -0.7 -2.1125 0 -0.96665 0.34165 -1.79165 1.025 -2.475 0.68335 -0.68335 1.50835 -1.025 2.475 -1.025s1.79165 0.34165 2.475 1.025c0.68335 0.68335 1.025 1.50835 1.025 2.475 0 0.75 -0.2125 1.41665 -0.6375 2 -0.425 0.58335 -0.9625 1 -1.6125 1.25l0.975 0.975c0.08335 0.07735 0.125 0.1675 0.125 0.2705 0 0.103 -0.04165 0.19615 -0.125 0.2795l-0.95 0.95c-0.08335 0.07735 -0.125 0.1675 -0.125 0.2705 0 0.103 0.04165 0.19615 0.125 0.2795l0.95 0.95c0.08335 0.07735 0.125 0.1675 0.125 0.2705 0 0.103 -0.04165 0.19615 -0.125 0.2795l-1.45 1.45c-0.07735 0.08335 -0.1675 0.125 -0.2705 0.125 -0.103 0 -0.19615 -0.04165 -0.2795 -0.125Z"></path>
    </svg>
);

const LoginCarousel = () => {
    return (
        <div className="relative h-[280px] w-full flex items-center justify-center my-4 [perspective:1000px]">
            {/* Left Card */}
            <div 
                className="absolute w-[140px] h-[249px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center opacity-60 blur-[1px] transition-all duration-1000 ease-in-out animate-in slide-in-from-left-8 fade-in"
                style={{ transform: 'translateX(-90px) translateZ(-100px) rotateY(-20deg) scale(0.9)' }}
            >
                 <img src="https://picsum.photos/seed/auth1/280/500" className="absolute inset-0 w-full h-full object-cover" alt="Preview 1" />
                 <div className="absolute inset-0 bg-black/50"></div>
                 <div className="relative z-10 w-full px-4 flex flex-col gap-2 items-center">
                    <div className="w-8 h-1 bg-white/40 rounded-full mb-1"></div>
                    <div className="w-full h-1.5 bg-white/20 rounded-full"></div>
                    <div className="w-5/6 h-1.5 bg-white/20 rounded-full"></div>
                    <div className="w-4/6 h-1.5 bg-white/20 rounded-full"></div>
                 </div>
            </div>

            {/* Right Card */}
             <div 
                className="absolute w-[140px] h-[249px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center opacity-60 blur-[1px] transition-all duration-1000 ease-in-out animate-in slide-in-from-right-8 fade-in"
                style={{ transform: 'translateX(90px) translateZ(-100px) rotateY(20deg) scale(0.9)' }}
            >
                 <img src="https://picsum.photos/seed/auth2/280/500" className="absolute inset-0 w-full h-full object-cover" alt="Preview 2" />
                 <div className="absolute inset-0 bg-black/50"></div>
                 <div className="relative z-10 w-full px-4 flex flex-col gap-2 items-center">
                    <div className="w-8 h-1 bg-white/40 rounded-full mb-1"></div>
                    <div className="w-full h-1.5 bg-white/20 rounded-full"></div>
                    <div className="w-5/6 h-1.5 bg-white/20 rounded-full"></div>
                    <div className="w-3/4 h-1.5 bg-white/20 rounded-full"></div>
                 </div>
            </div>

            {/* Center Card */}
            <div className="absolute w-[150px] h-[266px] rounded-2xl overflow-hidden border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 flex flex-col items-center justify-center p-5 text-center animate-in zoom-in fade-in duration-700 delay-200 group">
                <img src="https://picsum.photos/seed/auth3/300/532" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Center Verse" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30"></div>
                
                <div className="relative z-10 flex flex-col h-full justify-end pb-8">
                    <p className="text-[10px] font-bold text-white/90 tracking-widest uppercase mb-2">Salmos 23:1</p>
                    <h3 className="text-sm font-serif font-bold text-white leading-snug drop-shadow-md">"El Señor es mi pastor; nada me faltará."</h3>
                    <div className="mt-4 flex justify-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-white/30"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-white/30"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<'splash' | 'login' | 'onboarding'>('splash');
  const [onboardingStep, setOnboardingStep] = useState(0); // 0: Profile Pic, 1: Info, 2: Tutorial
  const [tempUser, setTempUser] = useState<User | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Tutorial Slide State
  const [tutorialIndex, setTutorialIndex] = useState(0);
  const TUTORIAL_SLIDES = [
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

  // Splash Screen Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setView('login');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Tutorial Auto-Advance
  useEffect(() => {
    if (view === 'onboarding' && onboardingStep === 2) {
        const timer = setInterval(() => {
            setTutorialIndex(prev => (prev + 1) % TUTORIAL_SLIDES.length);
        }, 4000);
        return () => clearInterval(timer);
    }
  }, [view, onboardingStep]);

  const login = useGoogleLogin({
    onSuccess: tokenResponse => {
      // For this demo, since we don't have a backend to verify the access_token effectively 
      // without CORS issues on some simple setups, we will simulate fetching user info 
      // or use the ID token if available (Code flow vs Implicit).
      // However, typical pattern with @react-oauth/google useGoogleLogin (implicit) is fetching userinfo endpoint.
      
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      })
      .then(res => res.json())
      .then(userInfo => {
         const initialUser: User = {
             name: userInfo.name,
             email: userInfo.email,
             picture: userInfo.picture,
             username: userInfo.email.split('@')[0], // Default username
             bio: "Amante de la Palabra ✨"
         };
         setTempUser(initialUser);
         setView('onboarding');
      });
    },
    onError: () => console.log('Login Failed'),
  });

  const handlePasskeyLogin = () => {
      // Simulate Passkey/WebAuthn Login Flow
      // In a real app, this would use navigator.credentials.get() or navigator.credentials.create()
      
      // Since Passkey login implies we don't get profile info like Google provides,
      // we initialize with empty strings so the user can fill them in onboarding.
      const initialUser: User = {
          name: "",
          email: "", // Passkeys usually identify the user, but we'll ask for details or assume known
          picture: "", 
          username: "",
          bio: "Amante de la Palabra ✨"
      };
      setTempUser(initialUser);
      setView('onboarding');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setTempUser(prev => prev ? { ...prev, picture: url } : null);
    }
  };

  const handleComplete = () => {
      if (tempUser) {
          onLoginSuccess(tempUser);
      }
  };

  if (view === 'splash') {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-out fade-out duration-1000 delay-2000 fill-mode-forwards">
        <div className="flex flex-col items-center animate-in zoom-in duration-1000">
             <img src="https://iili.io/fh2eSbn.png" alt="Logo" className="w-28 h-28 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] mb-6" />
             <h1 className="text-3xl font-serif font-bold text-white tracking-widest uppercase">Versículos</h1>
             <h2 className="text-xl font-light text-gray-400 tracking-[0.3em] uppercase mt-2">Eternos</h2>
        </div>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
         <div className="w-full max-w-sm flex flex-col items-center gap-2 mb-4">
             <img src="https://iili.io/fh2eSbn.png" alt="Logo" className="w-20 h-20 object-contain drop-shadow-2xl mb-2" />
             <h1 className="text-2xl font-bold text-white tracking-wide">VERSÍCULOS ETERNOS</h1>
             <p className="text-gray-500 text-sm">Crea. Inspira. Comparte.</p>
         </div>

         {/* 3D Carousel */}
         <LoginCarousel />

         <div className="w-full max-w-sm flex flex-col items-center gap-4 mt-4">
             {/* Google Button */}
             <button 
                onClick={() => login()}
                className="w-full py-3.5 px-6 rounded-full border border-white text-white font-bold flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all duration-300 group"
             >
                <svg className="w-5 h-5 group-hover:text-black fill-current" viewBox="0 0 24 24">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.013-1.147 8.027-3.24 2.053-2.053 2.853-4.933 2.853-7.333 0-.573-.053-1.12-.12-1.667h-10.76z" />
                </svg>
                Continuar con Google
             </button>

             {/* Passkey Button */}
             <button 
                onClick={handlePasskeyLogin}
                className="w-full py-3.5 px-6 rounded-full border border-white text-white font-bold flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all duration-300 group"
             >
                <PasskeyIcon className="w-5 h-5 group-hover:text-black transition-colors" />
                Continuar con Passkey
             </button>
             
             <p className="text-xs text-gray-600 text-center max-w-xs leading-relaxed mt-2">
                 Al continuar, aceptas inspirar al mundo con la belleza de la palabra.
             </p>
         </div>
      </div>
    );
  }

  // ONBOARDING FLOW
  return (
    <div className="fixed inset-0 z-[60] bg-black text-white flex flex-col animate-in fade-in duration-500">
       
       {/* Step 0: Profile Pic */}
       {onboardingStep === 0 && (
           <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in slide-in-from-right duration-500">
               <h2 className="text-3xl font-bold">¡Bienvenido!</h2>
               <p className="text-gray-400">Así te verán los demás en la comunidad.</p>
               
               <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                   <div className="w-32 h-32 rounded-full border-2 border-white/20 p-1 bg-white/10 flex items-center justify-center overflow-hidden">
                       {tempUser?.picture ? (
                           <img src={tempUser.picture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                       ) : (
                           <span className="text-4xl">👤</span>
                       )}
                   </div>
                   <div className="absolute bottom-0 right-0 bg-white text-black p-2 rounded-full shadow-lg">
                       <Camera size={18} />
                   </div>
               </div>
               <input 
                   ref={fileInputRef}
                   type="file" 
                   accept="image/*" 
                   className="hidden" 
                   onChange={handleImageUpload} 
               />
               
               <p className="text-xs text-gray-500">Pulsa para subir una foto</p>
           </div>
       )}

       {/* Step 1: Info */}
       {onboardingStep === 1 && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto space-y-8 animate-in slide-in-from-right duration-500">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold">Tu Identidad</h2>
                    <p className="text-gray-400">Crea un nombre de usuario único.</p>
                </div>

                <div className="w-full space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-2">Nombre</label>
                        <input 
                            type="text" 
                            value={tempUser?.name}
                            onChange={(e) => setTempUser(prev => prev ? {...prev, name: e.target.value} : null)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-white/50"
                            placeholder="Tu nombre completo"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-2">Usuario</label>
                        <div className="relative">
                            <span className="absolute left-4 top-4 text-gray-400">@</span>
                            <input 
                                type="text" 
                                value={tempUser?.username}
                                onChange={(e) => setTempUser(prev => prev ? {...prev, username: e.target.value} : null)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-8 text-white focus:outline-none focus:border-white/50"
                                placeholder="usuario"
                            />
                        </div>
                    </div>
                </div>
            </div>
       )}

       {/* Step 2: Tutorial */}
       {onboardingStep === 2 && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                <div className="flex-1 flex flex-col items-center justify-center max-w-md w-full">
                    <div className="min-h-[300px] flex flex-col items-center justify-center space-y-8">
                        <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-4 animate-bounce">
                            {TUTORIAL_SLIDES[tutorialIndex].icon}
                        </div>
                        
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold text-white tracking-tight animate-in slide-in-from-bottom-2 fade-in duration-500 key={title-${tutorialIndex}}">
                                {TUTORIAL_SLIDES[tutorialIndex].title}
                            </h2>
                            <p className="text-gray-400 text-lg leading-relaxed animate-in slide-in-from-bottom-4 fade-in duration-500 key={desc-${tutorialIndex}}">
                                {TUTORIAL_SLIDES[tutorialIndex].description}
                            </p>
                        </div>
                    </div>

                    {/* Indicators */}
                    <div className="flex gap-2 mt-8">
                        {TUTORIAL_SLIDES.map((_, idx) => (
                            <div 
                                key={idx}
                                className={`h-2 rounded-full transition-all duration-300 ${idx === tutorialIndex ? 'w-8 bg-white' : 'w-2 bg-white/20'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
       )}

       {/* Navigation Button */}
       <div className={`absolute bottom-8 w-full px-6 flex ${onboardingStep === 2 ? 'md:justify-end justify-center' : 'md:justify-end justify-center'}`}>
            <button 
                onClick={() => {
                    if (onboardingStep < 2) setOnboardingStep(prev => prev + 1);
                    else handleComplete();
                }}
                className="py-3 px-8 bg-white text-black rounded-full font-bold text-lg flex items-center gap-2 hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)] md:mr-8"
            >
                {onboardingStep === 2 ? 'Comenzar' : 'Siguiente'}
                {onboardingStep === 2 ? <Check size={20} /> : <ArrowRight size={20} />}
            </button>
       </div>
    </div>
  );
};