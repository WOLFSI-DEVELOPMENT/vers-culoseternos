import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Image as ImageIcon, Type, Sparkles, Upload, ArrowLeft, X, Save, ChevronLeft, ArrowUp, Check, Smile, Search, Film, Loader2, ChevronDown, Sticker, Sliders, Zap, Droplet, RectangleVertical, RectangleHorizontal } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Onboarding } from './Onboarding';
import { SavedDesign } from '../types';

const GIPHY_API_KEY = 'ZLSxKuCFZ91nkajXrfGYq6dYX49WVED2';
const PEXELS_API_KEY = 'kn3nF2UY3fvyw9ohB3kyXAcOGIQFkHttaYOcYFpfsi7E9tDX4TgAXgky';

const FONTS = [
  { name: 'Moderno', family: 'Montserrat, sans-serif' },
  { name: 'Elegante', family: 'Playfair Display, serif' },
  { name: 'Clásico', family: 'Merriweather, serif' },
  { name: 'Manuscrito', family: 'Dancing Script, cursive' },
  { name: 'Cinematográfico', family: 'Cinzel, serif' },
  { name: 'Limpio', family: 'Lato, sans-serif' },
  { name: 'Impacto', family: 'Oswald, sans-serif' },
  { name: 'Suave', family: 'Raleway, sans-serif' },
  { name: 'Retro', family: 'Pacifico, cursive' },
  { name: 'Fuerte', family: 'Abril Fatface, cursive' },
  { name: 'Urbano', family: 'Bebas Neue, sans-serif' },
];

const COLOR_PALETTE = [
  '#FFFFFF', '#000000', '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', 
  '#0000FF', '#4B0082', '#9400D3', '#FF1493', '#00CED1', '#FFD700',
  '#FF69B4', '#8A2BE2', '#32CD32', '#00FA9A', '#1E90FF', '#FF4500'
];

const FILTERS = [
  { name: 'Normal', value: 'none' },
  { name: 'Noir', value: 'grayscale(100%) contrast(120%)' },
  { name: 'Sepia', value: 'sepia(60%) contrast(110%)' },
  { name: 'Vintage', value: 'sepia(40%) contrast(90%) brightness(110%)' },
  { name: 'Vivid', value: 'saturate(150%) contrast(110%)' },
  { name: 'Fade', value: 'brightness(110%) contrast(90%) sepia(20%)' },
  { name: 'Cold', value: 'hue-rotate(180deg) sepia(20%)' },
  { name: 'Warm', value: 'sepia(30%) saturate(140%) hue-rotate(-10deg)' },
  { name: 'Dramatic', value: 'contrast(150%) saturate(110%)' },
];

const EMOJIS = ["❤️", "🙏", "✨", "🕊️", "✝️", "🙌", "🌿", "📖", "🔥", "💡", "👑", "🦁", "🐑", "☁️", "🌟", "🌹", "⛪", "🍇", "🍞", "🛡️"];

// Helper to mix colors or find themes
const THEME_COLORS: Record<string, string[]> = {
    sunset: ['#ff5f6d', '#ffc371', '#ff9a9e', '#fecfef'],
    ocean: ['#2193b0', '#6dd5ed', '#2c3e50', '#bdc3c7'],
    forest: ['#134E5E', '#71B280', '#5D4157', '#A8CABA'],
    fire: ['#f12711', '#f5af19', '#833ab4', '#fd1d1d'],
    galaxy: ['#0f2027', '#203a43', '#2c5364', '#667db6'],
    love: ['#ff9a9e', '#fecfef', '#feada6', '#f5efef'],
    royal: ['#141E30', '#243B55', '#333333', '#dd1818']
};

interface Overlay {
    id: string;
    type: 'emoji' | 'gif';
    content: string;
    x: number;
    y: number;
    scale: number;
}

interface CreateEditorProps {
  onBack?: () => void;
  onSaveDesign: (design: SavedDesign) => void;
}

// --- CUSTOM LIQUID GLASS SLIDER COMPONENT ---
const GlassSlider = ({ value, min, max, onChange, label }: { value: number, min: number, max: number, onChange: (val: number) => void, label?: string }) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const [isSliding, setIsSliding] = useState(false);

    const handleMove = useCallback((clientX: number) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const percent = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
        const newValue = Math.round(min + percent * (max - min));
        onChange(newValue);
    }, [min, max, onChange]);

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsSliding(true);
        e.currentTarget.setPointerCapture(e.pointerId);
        handleMove(e.clientX);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (isSliding) handleMove(e.clientX);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsSliding(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    const percent = ((value - min) / (max - min)) * 100;

    return (
        <div className="w-full mb-6 mt-2">
             {label && (
                <div className="flex justify-between text-xs text-gray-300 uppercase font-bold mb-3 tracking-widest pl-1">
                    <span>{label}</span>
                    <span>{value}%</span>
                </div>
             )}
            <div 
                className="relative h-10 flex items-center cursor-pointer touch-none select-none group"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            >
                {/* Track Background */}
                <div ref={trackRef} className="absolute w-full h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                    {/* Active Track Fill */}
                    <div 
                        className="h-full bg-gradient-to-r from-blue-400/50 to-purple-400/50 blur-[2px] transition-all duration-75 ease-out" 
                        style={{ width: `${percent}%` }}
                    />
                </div>

                {/* Liquid Pill Thumb */}
                <div 
                    className="absolute h-6 w-12 rounded-full backdrop-blur-xl bg-white/20 border border-white/40 shadow-[0_4px_14px_0_rgba(255,255,255,0.15)] flex items-center justify-center transition-transform duration-150 ease-out will-change-transform"
                    style={{ 
                        left: `calc(${percent}% - 24px)`, // Center the 48px (w-12) thumb
                        transform: isSliding ? 'scale(1.1)' : 'scale(1)'
                    }}
                >
                    {/* Inner Glint */}
                    <div className="w-4 h-1 bg-white/40 rounded-full mb-1" />
                </div>
            </div>
        </div>
    );
};


export const CreateEditor: React.FC<CreateEditorProps> = ({ onBack, onSaveDesign }) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Design State
  const [text, setText] = useState('Todo lo puedo en Cristo que me fortalece.');
  const [reference, setReference] = useState('Filipenses 4:13');
  const [fontIndex, setFontIndex] = useState(1);
  const [bgType, setBgType] = useState<'gradient' | 'image'>('gradient');
  const [gradient, setGradient] = useState('linear-gradient(to top, #0f2027, #203a43, #2c5364)');
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  
  // Advanced Visuals
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [sharpenLevel, setSharpenLevel] = useState(0); // 0 to 100
  const [textOpacity, setTextOpacity] = useState(100); // 0 to 100
  const [bgOverlayOpacity, setBgOverlayOpacity] = useState(40); // 0 to 100
  
  // UI State
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadMode, setDownloadMode] = useState<'png' | 'gif' | 'mp4'>('png');
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);

  // Generator State
  const [isGradientMode, setIsGradientMode] = useState(false);
  const [gradientPrompt, setGradientPrompt] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [generatedResults, setGeneratedResults] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tempSelectedGradient, setTempSelectedGradient] = useState<string | null>(null);
  
  // Drag State
  const [activeOverlayId, setActiveOverlayId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 }); // Mouse position
  const initialOverlayPos = useRef({ x: 0, y: 0 }); // Overlay percent position

  // Search State
  const [giphyQuery, setGiphyQuery] = useState('');
  const [giphyResults, setGiphyResults] = useState<string[]>([]);
  const [pexelsQuery, setPexelsQuery] = useState('');
  const [pexelsResults, setPexelsResults] = useState<string[]>([]);
  
  const captureRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mobile Specific State
  const [activeMobileTool, setActiveMobileTool] = useState<'text' | 'bg' | 'stickers' | 'gifs' | 'filters' | 'sharpen' | null>(null);

  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenCreateOnboarding');
    if (!hasSeen) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenCreateOnboarding', 'true');
    setShowOnboarding(false);
  };

  // --- ASYNC SEARCH ---
  const searchGiphy = async () => {
      if (!giphyQuery) return;
      try {
          const res = await fetch(`https://api.giphy.com/v1/stickers/search?api_key=${GIPHY_API_KEY}&q=${giphyQuery}&limit=12&rating=g`);
          const data = await res.json();
          setGiphyResults(data.data.map((item: any) => item.images.fixed_height.url));
      } catch (e) {
          console.error("Giphy error", e);
      }
  };

  const searchPexels = async () => {
      if (!pexelsQuery) return;
      try {
          const res = await fetch(`https://api.pexels.com/v1/search?query=${pexelsQuery}&per_page=12`, {
              headers: { Authorization: PEXELS_API_KEY }
          });
          const data = await res.json();
          setPexelsResults(data.photos.map((p: any) => p.src.large2x));
      } catch (e) {
          console.error("Pexels error", e);
      }
  };

  // --- OVERLAY LOGIC ---
  const addOverlay = (type: 'emoji' | 'gif', content: string) => {
      const newOverlay: Overlay = {
          id: Date.now().toString(),
          type,
          content,
          x: 50, // Percent
          y: 50, // Percent
          scale: 1
      };
      setOverlays(prev => [...prev, newOverlay]);
      setActiveOverlayId(newOverlay.id);
  };

  const removeOverlay = (id: string) => {
      setOverlays(prev => prev.filter(o => o.id !== id));
      setActiveOverlayId(null);
  };

  const updateOverlayScale = (val: number) => {
      if(!activeOverlayId) return;
      setOverlays(prev => prev.map(o => o.id === activeOverlayId ? { ...o, scale: val } : o));
  };

  // --- UNIVERSAL DRAG HANDLERS ---
  const handlePointerDown = (e: React.PointerEvent, id: string) => {
      e.stopPropagation(); // Stop bubbling to card
      e.preventDefault(); // Stop default browser drag
      
      const overlay = overlays.find(o => o.id === id);
      if(!overlay) return;

      setActiveOverlayId(id);
      setIsDragging(true);
      
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      initialOverlayPos.current = { x: overlay.x, y: overlay.y };
  };

  // Global move handler attached to window
  useEffect(() => {
    const handleGlobalMove = (e: PointerEvent) => {
        if (!isDragging || !activeOverlayId || !captureRef.current) return;
        
        const rect = captureRef.current.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const deltaX = e.clientX - dragStartPos.current.x;
        const deltaY = e.clientY - dragStartPos.current.y;

        // Calculate new percentage based on initial position + delta
        // We use initial pos to avoid compounding errors
        const percentDeltaX = (deltaX / rect.width) * 100;
        const percentDeltaY = (deltaY / rect.height) * 100;

        const newX = initialOverlayPos.current.x + percentDeltaX;
        const newY = initialOverlayPos.current.y + percentDeltaY;

        setOverlays(prev => prev.map(o => {
            if (o.id === activeOverlayId) {
                return { ...o, x: newX, y: newY };
            }
            return o;
        }));
    };

    const handleGlobalUp = () => {
        setIsDragging(false);
    };

    if (isDragging) {
        window.addEventListener('pointermove', handleGlobalMove);
        window.addEventListener('pointerup', handleGlobalUp);
        // Also handle cases where mouse leaves window
        window.addEventListener('pointerleave', handleGlobalUp);
    }

    return () => {
        window.removeEventListener('pointermove', handleGlobalMove);
        window.removeEventListener('pointerup', handleGlobalUp);
        window.removeEventListener('pointerleave', handleGlobalUp);
    };
  }, [isDragging, activeOverlayId]);


  // --- IMAGE LOGIC ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setBgImage(url);
      setBgType('image');
      setIsGradientMode(false);
    }
  };

  const saveDesign = () => {
    const newDesign: SavedDesign = {
        id: Date.now().toString(),
        text,
        reference,
        fontIndex,
        bgType,
        gradient,
        bgImage,
        timestamp: Date.now()
    };
    onSaveDesign(newDesign);
    alert('Diseño guardado en tu perfil');
  };

  const triggerDownload = async (format: 'png' | 'gif' | 'mp4') => {
    if (!captureRef.current) return;
    setIsDownloading(true);
    setDownloadMode(format);
    setDownloadProgress(0);
    setIsDownloadMenuOpen(false);

    // Simulate progress for video/gif
    const isVideo = format !== 'png';
    if (isVideo) {
        const interval = setInterval(() => {
            setDownloadProgress(prev => {
                if (prev >= 95) {
                    clearInterval(interval);
                    return 95;
                }
                return prev + 5;
            });
        }, 200);
        await new Promise(resolve => setTimeout(resolve, format === 'mp4' ? 3000 : 2000));
        clearInterval(interval);
    }

    try {
      const canvas = await html2canvas(captureRef.current, {
        scale: 3, 
        useCORS: true, 
        backgroundColor: null,
      });

      const link = document.createElement('a');
      const ext = format === 'mp4' ? 'mp4' : (format === 'gif' ? 'gif' : 'png');
      link.download = `versiculo-${Date.now()}.${ext}`;
      link.href = canvas.toDataURL('image/png'); 
      link.click();
      
      setDownloadProgress(100);
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setTimeout(() => {
          setIsDownloading(false);
          setDownloadProgress(0);
      }, 1000);
    }
  };

  // --- SMART GRADIENT ENGINE ---
  const toggleColorSelection = (color: string) => {
    let newColors = [...selectedColors];
    if (newColors.includes(color)) {
      newColors = newColors.filter(c => c !== color);
    } else {
      newColors.push(color);
    }
    setSelectedColors(newColors);
  };

  const generateSmartGradients = (prompt: string, contextColors: string[]) => {
      const newGradients: string[] = [];
      const lowerPrompt = prompt.toLowerCase();
      
      let palette: string[] = [...contextColors];
      
      Object.keys(THEME_COLORS).forEach(theme => {
          if (lowerPrompt.includes(theme) || (theme === 'love' && lowerPrompt.includes('amor'))) {
              palette = [...palette, ...THEME_COLORS[theme]];
          }
      });
      
      if (palette.length === 0) {
          palette = ['#8EC5FC', '#E0C3FC', '#80D0C7', '#0093E9'];
      }

      const directions = ['to top', 'to right', 'to bottom', 'to left', '45deg', '135deg', '-45deg', 'circle at center', 'circle at top left'];
      
      for (let i = 0; i < 15; i++) {
          const shuffled = [...palette].sort(() => 0.5 - Math.random());
          const numColors = Math.random() > 0.5 ? 2 : 3;
          const picks = shuffled.slice(0, Math.max(2, Math.min(numColors, shuffled.length)));
          const dir = directions[i % directions.length];
          
          if (dir.includes('circle')) {
              newGradients.push(`radial-gradient(${dir}, ${picks.join(', ')})`);
          } else {
              newGradients.push(`linear-gradient(${dir}, ${picks.join(', ')})`);
          }
      }
      return newGradients;
  };

  const handleEngineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setTempSelectedGradient(null); 
    await new Promise(resolve => setTimeout(resolve, 800));
    const results = generateSmartGradients(gradientPrompt, selectedColors);
    setGeneratedResults(results);
    setIsGenerating(false);
  };

  const handleResultSelect = (gradientStr: string) => {
     if (tempSelectedGradient === gradientStr) {
         setTempSelectedGradient(null); 
     } else {
         setTempSelectedGradient(gradientStr);
         setGradient(gradientStr);
         setBgType('gradient');
     }
  };

  const confirmUseGradient = () => {
      setIsGradientMode(false);
      setGeneratedResults([]); 
      setTempSelectedGradient(null);
      setGradientPrompt('');
      setSelectedColors([]);
      setActiveMobileTool(null);
  };

  // --- RENDER HELPERS ---
  
  const renderAspectRatioSwitcher = () => (
      <div className="absolute top-20 left-0 right-0 z-40 flex justify-center pointer-events-none">
          <div className="bg-black/30 backdrop-blur-md rounded-full p-1 flex items-center pointer-events-auto border border-white/10">
              <button 
                  onClick={() => setAspectRatio('9:16')}
                  className={`p-2 rounded-full transition-colors ${aspectRatio === '9:16' ? 'bg-white/20 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                  title="Vertical (9:16)"
              >
                  <RectangleVertical size={20} strokeWidth={aspectRatio === '9:16' ? 3 : 2} />
              </button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button 
                  onClick={() => setAspectRatio('16:9')}
                  className={`p-2 rounded-full transition-colors ${aspectRatio === '16:9' ? 'bg-white/20 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                  title="Horizontal (16:9)"
              >
                  <RectangleHorizontal size={20} strokeWidth={aspectRatio === '16:9' ? 3 : 2} />
              </button>
          </div>
      </div>
  );
  
  const renderGradientEngineUI = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500 h-full flex flex-col">
       <div className="flex items-center gap-2 mb-2">
            <button 
                onClick={() => setIsGradientMode(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
            >
                <ChevronLeft size={20} />
            </button>
            <h3 className="text-white font-bold text-lg">Motor de Gradientes</h3>
       </div>

       <div className="flex-1 overflow-y-auto min-h-[200px] p-1 custom-scrollbar">
           {isGenerating ? (
               <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                   <Loader2 className="animate-spin text-white" size={32} />
                   <p className="text-xs uppercase tracking-widest animate-pulse">Creando magia...</p>
               </div>
           ) : generatedResults.length > 0 ? (
               <div className="grid grid-cols-5 gap-2">
                   {generatedResults.map((res, idx) => (
                       <button
                          key={idx}
                          onClick={() => handleResultSelect(res)}
                          className={`aspect-square w-full rounded-lg transition-all duration-200 ${tempSelectedGradient === res ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-90 z-10' : 'hover:scale-105 opacity-90 hover:opacity-100'}`}
                          style={{ background: res }}
                       />
                   ))}
               </div>
           ) : (
               <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center px-4 border-2 border-dashed border-white/10 rounded-2xl">
                   <Sparkles size={24} className="mb-2 opacity-50" />
                   <p className="text-xs">Describe tu idea y selecciona colores para generar 15 variaciones únicas.</p>
               </div>
           )}
       </div>

       <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="text-xs text-gray-400 uppercase tracking-widest font-bold ml-2">
                Colores (Contexto)
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 px-2 no-scrollbar">
                {COLOR_PALETTE.map((color) => (
                    <button
                        key={color}
                        onClick={() => toggleColorSelection(color)}
                        className={`flex-shrink-0 w-8 h-8 rounded-full border border-white/20 transition-all transform flex items-center justify-center ${selectedColors.includes(color) ? 'scale-110 ring-2 ring-white ring-offset-1 ring-offset-black' : 'hover:scale-105 opacity-60 hover:opacity-100'}`}
                        style={{ backgroundColor: color }}
                    >
                        {selectedColors.includes(color) && <Check size={14} className={color === '#FFFFFF' ? 'text-black' : 'text-white'} strokeWidth={3} />}
                    </button>
                ))}
            </div>
       </div>

       <div className="relative mt-1">
            {tempSelectedGradient ? (
                <button 
                    onClick={confirmUseGradient}
                    className="w-full bg-white text-black font-bold rounded-full py-4 text-center hover:bg-gray-200 transition-colors animate-in zoom-in duration-300"
                >
                    Usar Gradiente
                </button>
            ) : (
                <form onSubmit={handleEngineSubmit} className="relative">
                    <input 
                        type="text"
                        value={gradientPrompt}
                        onChange={(e) => setGradientPrompt(e.target.value)}
                        placeholder="Ej: Atardecer místico..."
                        className="w-full bg-white/5 backdrop-blur-xl border border-white/20 rounded-full py-4 pl-6 pr-14 text-white placeholder:text-gray-400 focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all"
                    />
                    <button 
                        type="submit"
                        disabled={isGenerating}
                        className="absolute right-2 top-2 bottom-2 w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
                    >
                        {isGenerating ? <Loader2 size={20} className="animate-spin"/> : <ArrowUp size={20} strokeWidth={3} />}
                    </button>
                </form>
            )}
       </div>
    </div>
  );

  const renderPreviewCard = () => (
    <div 
      ref={captureRef}
      className={`relative rounded-[3rem] overflow-hidden shadow-2xl flex items-center justify-center p-8 text-center mx-auto touch-none select-none transition-all duration-500 ease-in-out ${aspectRatio === '9:16' ? 'w-[320px] h-[569px] sm:w-[360px] sm:h-[640px]' : 'w-[569px] h-[320px] sm:w-[640px] sm:h-[360px]'}`}
      style={{
        background: bgType === 'gradient' ? gradient : 'transparent',
      }}
    >
      {bgType === 'image' && bgImage && (
        <>
            <img 
                src={bgImage} 
                alt="Background" 
                className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-all duration-300"
                style={{ 
                    filter: `${selectedFilter} contrast(${100 + (sharpenLevel * 0.5)}%) saturate(${100 + (sharpenLevel * 0.3)}%)` 
                }} 
            />
            <div 
                className="absolute inset-0 pointer-events-none transition-all duration-300" 
                style={{ backgroundColor: `rgba(0,0,0, ${bgOverlayOpacity / 100})` }}
            />
        </>
      )}

      {/* Main Text Layer (Below Overlays) */}
      <div 
        className="relative z-10 text-white drop-shadow-lg pointer-events-none select-none transition-opacity duration-300"
        style={{ opacity: textOpacity / 100 }}
      >
        <h2 
          className="text-2xl sm:text-3xl font-bold mb-4 leading-relaxed"
          style={{ fontFamily: FONTS[fontIndex].family }}
        >
          {text}
        </h2>
        <p 
          className="text-sm sm:text-base opacity-90 font-medium tracking-wide uppercase mt-4"
          style={{ fontFamily: 'Lato, sans-serif' }}
        >
          {reference}
        </p>
      </div>

      {/* Overlays Layer */}
      {overlays.map((overlay) => (
          <div
            key={overlay.id}
            onPointerDown={(e) => handlePointerDown(e, overlay.id)}
            className={`absolute z-20 cursor-move transition-transform active:scale-105 ${activeOverlayId === overlay.id ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent rounded-lg' : ''}`}
            style={{
                left: `${overlay.x}%`,
                top: `${overlay.y}%`,
                transform: `translate(-50%, -50%) scale(${overlay.scale})`,
                touchAction: 'none' // Important for mobile drag
            }}
          >
              {overlay.type === 'emoji' ? (
                  <span className="text-4xl drop-shadow-md select-none">{overlay.content}</span>
              ) : (
                  <img src={overlay.content} alt="sticker" className="w-24 h-24 object-contain drop-shadow-md select-none pointer-events-none" />
              )}
              
              {activeOverlayId === overlay.id && (
                  <button 
                    onPointerDown={(e) => { e.stopPropagation(); removeOverlay(overlay.id); }}
                    className="absolute -top-4 -right-4 bg-red-500 text-white p-1 rounded-full shadow-lg z-30"
                  >
                      <X size={12} />
                  </button>
              )}
          </div>
      ))}

      <div className="absolute bottom-6 text-[10px] text-white/50 font-sans tracking-widest uppercase pointer-events-none">
        Versículos Eternos
      </div>
    </div>
  );

  const renderDownloadButton = () => (
      <div className="relative w-full">
          {isDownloadMenuOpen ? (
               <div className="absolute bottom-0 left-0 right-0 bg-zinc-800 rounded-3xl p-2 border border-white/10 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <button 
                        onClick={() => triggerDownload('png')} 
                        className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-xl text-white font-medium flex items-center justify-between"
                    >
                        <span>Imagen PNG</span>
                        <ImageIcon size={16} className="text-gray-400" />
                    </button>
                    <button 
                        onClick={() => triggerDownload('gif')}
                        className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-xl text-white font-medium flex items-center justify-between"
                    >
                        <span>GIF Animado (5s)</span>
                        <Film size={16} className="text-purple-400" />
                    </button>
                    <button 
                        onClick={() => triggerDownload('mp4')}
                        className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-xl text-white font-medium flex items-center justify-between"
                    >
                        <span>Video MP4 (7s)</span>
                        <Film size={16} className="text-blue-400" />
                    </button>
                    <div className="h-px bg-white/10 my-1" />
                    <button 
                        onClick={() => setIsDownloadMenuOpen(false)}
                        className="w-full text-center py-2 text-xs text-gray-500 hover:text-white"
                    >
                        Cancelar
                    </button>
               </div>
          ) : (
            <button 
                onClick={isDownloading ? undefined : () => setIsDownloadMenuOpen(true)}
                disabled={isDownloading}
                className="w-full flex items-center justify-center gap-3 p-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
                {isDownloading ? (
                    <div className="flex items-center gap-3">
                        <Loader2 className="animate-spin" size={20} />
                        <span>{downloadMode === 'png' ? 'Guardando...' : `Renderizando ${downloadProgress}%`}</span>
                    </div>
                ) : (
                    <>
                        <Download size={20} />
                        Descargar
                        <ChevronDown size={16} className="opacity-50" />
                    </>
                )}
            </button>
          )}
      </div>
  );

  const renderStickersTool = () => (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
           {/* Size Slider for Selected Item */}
           {activeOverlayId && (
               <div className="mb-4">
                   <GlassSlider 
                        label="Tamaño del Sticker"
                        min={50} max={300}
                        value={(overlays.find(o => o.id === activeOverlayId)?.scale || 1) * 100}
                        onChange={(val) => updateOverlayScale(val / 100)}
                   />
               </div>
           )}

           <div className="space-y-2">
               <h3 className="text-white font-bold text-sm uppercase tracking-wider">Emojis</h3>
               <div className="flex flex-wrap gap-2">
                   {EMOJIS.map(emoji => (
                       <button
                         key={emoji}
                         onClick={() => addOverlay('emoji', emoji)}
                         className="text-2xl p-2 hover:bg-white/10 rounded-lg transition-colors"
                       >
                           {emoji}
                       </button>
                   ))}
               </div>
           </div>
      </div>
  );

  const renderGifsTool = () => (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
           {activeOverlayId && (
               <div className="mb-4">
                   <GlassSlider 
                        label="Tamaño del GIF"
                        min={50} max={300}
                        value={(overlays.find(o => o.id === activeOverlayId)?.scale || 1) * 100}
                        onChange={(val) => updateOverlayScale(val / 100)}
                   />
               </div>
           )}

           <div className="space-y-2">
               <h3 className="text-white font-bold text-sm uppercase tracking-wider">Giphy Stickers</h3>
               
               {/* Pill Shaped Search Bar */}
               <div className="relative">
                   <input 
                      type="text" 
                      placeholder="Buscar en Giphy..." 
                      className="w-full bg-white/5 border border-white/10 rounded-full pl-5 pr-12 py-3 text-sm text-white focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all"
                      value={giphyQuery}
                      onChange={(e) => setGiphyQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchGiphy()}
                   />
                   <button 
                        onClick={searchGiphy} 
                        className="absolute right-1 top-1 bottom-1 w-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform"
                   >
                       <Search size={18} />
                   </button>
               </div>

               <div className="grid grid-cols-4 gap-2 mt-4">
                   {giphyResults.map((url, i) => (
                       <button key={i} onClick={() => addOverlay('gif', url)} className="aspect-square bg-black/20 rounded-lg overflow-hidden hover:ring-2 ring-white">
                           <img src={url} className="w-full h-full object-contain" />
                       </button>
                   ))}
               </div>
           </div>
      </div>
  );

  const renderFiltersTool = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
        <h3 className="text-white font-bold text-lg mb-2">Filtros de Imagen</h3>
        <div className="grid grid-cols-3 gap-3">
            {FILTERS.map((filter) => (
                <button
                    key={filter.name}
                    onClick={() => setSelectedFilter(filter.value)}
                    className={`aspect-square rounded-xl overflow-hidden relative group border transition-all ${selectedFilter === filter.value ? 'border-white ring-2 ring-white ring-offset-2 ring-offset-black' : 'border-white/10 hover:border-white/50'}`}
                >
                    <div className="absolute inset-0 bg-gray-800" />
                    {bgImage && (
                        <img 
                            src={bgImage} 
                            className="absolute inset-0 w-full h-full object-cover" 
                            style={{ filter: filter.value }}
                        />
                    )}
                    <span className="absolute bottom-0 left-0 right-0 p-2 text-xs font-bold text-center bg-black/50 backdrop-blur-sm text-white">
                        {filter.name}
                    </span>
                </button>
            ))}
        </div>
    </div>
  );

  const renderSharpenTool = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6 text-white">
                <Zap className="text-yellow-400" />
                <h3 className="font-bold text-lg">Mejorar Detalles</h3>
            </div>
            
            <div className="space-y-6">
                <div>
                    <GlassSlider 
                        label="Intensidad"
                        min={0} max={100}
                        value={sharpenLevel}
                        onChange={(val) => setSharpenLevel(val)}
                    />
                </div>
                <p className="text-xs text-gray-500">
                    Aumenta el contraste y la saturación para dar más definición a tu imagen de fondo.
                </p>
            </div>
        </div>
    </div>
  );

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // --- MOBILE RENDER ---
  const renderMobileEditor = () => (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col md:hidden">
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-4 py-4">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black shadow-lg active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} strokeWidth={3} />
        </button>
        <div className="flex gap-2">
            <button 
              onClick={() => setIsDownloadMenuOpen(true)}
              className="px-6 py-2 bg-white text-black rounded-full font-bold text-sm shadow-lg active:scale-95 transition-transform"
            >
              Descargar
            </button>
        </div>
      </div>
      
      {renderAspectRatioSwitcher()}

      {/* Main Preview Area */}
      <div className="flex-1 flex items-center justify-center bg-gray-900/50 overflow-hidden pt-24 pb-20" onClick={() => setActiveMobileTool(null)}>
        <div className={`origin-center transform transition-all duration-300 ${aspectRatio === '16:9' ? 'scale-[0.55]' : 'scale-[0.85]'}`}>
           {renderPreviewCard()}
        </div>
      </div>

      {/* Download Menu Overlay (Mobile) */}
      {isDownloadMenuOpen && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center animate-in fade-in">
              <div className="w-full bg-zinc-900 rounded-t-3xl p-6 pb-10 space-y-4 border-t border-white/10">
                  <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-bold text-white">Guardar como...</h3>
                      <button onClick={() => setIsDownloadMenuOpen(false)}><X className="text-gray-400" /></button>
                  </div>
                  <button onClick={() => triggerDownload('png')} className="w-full p-4 bg-white/5 rounded-xl flex items-center gap-4 text-white font-bold border border-white/10">
                      <ImageIcon className="text-green-400" /> PNG de Alta Calidad
                  </button>
                  <button onClick={() => triggerDownload('gif')} className="w-full p-4 bg-white/5 rounded-xl flex items-center gap-4 text-white font-bold border border-white/10">
                      <Film className="text-purple-400" /> GIF Animado (5s)
                  </button>
                  <button onClick={() => triggerDownload('mp4')} className="w-full p-4 bg-white/5 rounded-xl flex items-center gap-4 text-white font-bold border border-white/10">
                      <Film className="text-blue-400" /> Video MP4 (7s)
                  </button>
                  {isDownloading && (
                      <div className="w-full bg-gray-800 rounded-full h-2 mt-4 overflow-hidden">
                          <div className="bg-white h-full transition-all duration-300" style={{ width: `${downloadProgress}%` }} />
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Bottom Toolbar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black border-t border-white/10 z-20">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-4 safe-area-pb">
          <button 
            onClick={() => { setActiveMobileTool('text'); setIsGradientMode(false); }}
            className={`flex-shrink-0 flex flex-col items-center gap-1 min-w-[70px] ${activeMobileTool === 'text' ? 'text-white' : 'text-gray-500'}`}
          >
            <div className="p-3 bg-white/10 rounded-full mb-1">
              <Type size={24} strokeWidth={2.5} className="text-white" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">Texto</span>
          </button>
          
          <button 
             onClick={() => { setActiveMobileTool('bg'); setIsGradientMode(false); }}
             className={`flex-shrink-0 flex flex-col items-center gap-1 min-w-[70px]`}
          >
            <div className="p-3 bg-white/10 rounded-full mb-1">
              <ImageIcon size={24} strokeWidth={2.5} className="text-white" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">Fondo</span>
          </button>

          <button 
             onClick={() => { setActiveMobileTool('filters'); }}
             className={`flex-shrink-0 flex flex-col items-center gap-1 min-w-[70px]`}
          >
            <div className="p-3 bg-white/10 rounded-full mb-1">
              <Sliders size={24} strokeWidth={2.5} className="text-white" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">Filtros</span>
          </button>

          <button 
             onClick={() => { setActiveMobileTool('sharpen'); }}
             className={`flex-shrink-0 flex flex-col items-center gap-1 min-w-[70px]`}
          >
            <div className="p-3 bg-white/10 rounded-full mb-1">
              <Zap size={24} strokeWidth={2.5} className="text-white" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">Sharpen</span>
          </button>

          <button 
             onClick={() => { setActiveMobileTool('stickers'); }}
             className={`flex-shrink-0 flex flex-col items-center gap-1 min-w-[70px]`}
          >
            <div className="p-3 bg-white/10 rounded-full mb-1">
              <Smile size={24} strokeWidth={2.5} className="text-white" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">Stickers</span>
          </button>

          <button 
             onClick={() => { setActiveMobileTool('gifs'); }}
             className={`flex-shrink-0 flex flex-col items-center gap-1 min-w-[70px]`}
          >
            <div className="p-3 bg-white/10 rounded-full mb-1">
              <Film size={24} strokeWidth={2.5} className="text-white" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">GIFs</span>
          </button>
        </div>
      </div>

      {/* Slide-Up Panel */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-[#0f0f0f] border-t border-gray-800 rounded-t-[2rem] z-30 transition-transform duration-300 ease-out shadow-[0_-5px_20px_rgba(0,0,0,0.8)] flex flex-col ${activeMobileTool ? 'translate-y-0 h-[55vh]' : 'translate-y-full h-0'}`}
      >
        <div className="w-full flex justify-center pt-3 pb-1" onClick={() => setActiveMobileTool(null)}>
          <div className="w-12 h-1 bg-gray-700 rounded-full" />
        </div>
        <div className="absolute top-4 right-4">
            <button onClick={() => setActiveMobileTool(null)} className="text-gray-400 p-2">
                <X size={20} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {activeMobileTool === 'text' && (
            <div className="space-y-4">
              <h3 className="text-white font-bold text-lg mb-2">Editar Texto</h3>
              <textarea 
                  value={text} onChange={(e) => setText(e.target.value)} rows={4}
                  className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                />
               <input 
                  type="text" value={reference} onChange={(e) => setReference(e.target.value)}
                  className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                />
                
                {/* Text Opacity Slider */}
                <div className="mt-4">
                    <GlassSlider 
                        label="Opacidad del Texto"
                        min={0} max={100}
                        value={textOpacity}
                        onChange={(val) => setTextOpacity(val)}
                    />
                </div>

                <h3 className="text-white font-bold text-lg mt-4">Fuente</h3>
                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                  {FONTS.map((font, idx) => (
                    <button
                      key={font.name} onClick={() => setFontIndex(idx)}
                      className={`flex-shrink-0 px-5 py-3 rounded-full text-sm border ${fontIndex === idx ? 'bg-white text-black' : 'bg-white/5 text-gray-400'}`}
                      style={{ fontFamily: font.family }}
                    >
                      {font.name}
                    </button>
                  ))}
               </div>
            </div>
          )}

          {activeMobileTool === 'stickers' && renderStickersTool()}
          {activeMobileTool === 'gifs' && renderGifsTool()}
          {activeMobileTool === 'filters' && renderFiltersTool()}
          {activeMobileTool === 'sharpen' && renderSharpenTool()}

          {activeMobileTool === 'bg' && (
             isGradientMode ? renderGradientEngineUI() : (
                <div className="space-y-6">
                    <h3 className="text-white font-bold text-lg mb-2">Estilo de Fondo</h3>
                    
                    {/* Overlay Opacity Slider */}
                    <div className="mt-4">
                        <GlassSlider 
                            label="Oscuridad del Fondo"
                            min={0} max={100}
                            value={bgOverlayOpacity}
                            onChange={(val) => setBgOverlayOpacity(val)}
                        />
                    </div>

                    <button onClick={() => setIsGradientMode(true)} className="w-full flex items-center justify-center gap-2 p-4 border border-white/30 rounded-full text-white">
                        <Sparkles size={18} /> Generar Gradiente Smart
                    </button>
                    <div className="border-t border-gray-800 pt-4 space-y-4">
                        <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 p-4 bg-white/5 rounded-full text-white">
                            <Upload size={18} /> Subir Propia
                        </button>
                        <div>
                           <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Buscar en Pexels</label>
                           <div className="flex gap-2 mb-2">
                               <input 
                                  value={pexelsQuery} onChange={(e) => setPexelsQuery(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && searchPexels()}
                                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/50" placeholder="Ej: Montañas..."
                                />
                               <button onClick={searchPexels} className="p-2 bg-white/10 rounded-lg text-white"><Search size={18}/></button>
                           </div>
                           <div className="grid grid-cols-4 gap-2">
                               {pexelsResults.map((src, i) => (
                                   <button key={i} onClick={() => { setBgImage(src); setBgType('image'); }} className="aspect-[9/16] rounded-lg overflow-hidden bg-white/5">
                                       <img src={src} className="w-full h-full object-cover" />
                                   </button>
                               ))}
                           </div>
                        </div>
                    </div>
                </div>
             )
          )}
        </div>
      </div>
    </div>
  );

  // --- DESKTOP RENDER ---
  const renderDesktopEditor = () => (
    <div className="hidden md:flex relative w-full min-h-[85vh] items-center justify-center pr-[400px]">
      
      {renderAspectRatioSwitcher()}

      <div className={`transform transition-all duration-500 ${aspectRatio === '16:9' ? 'scale-75' : 'scale-90 xl:scale-100'}`}>
        {renderPreviewCard()}
      </div>

      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[380px] bg-zinc-900/80 backdrop-blur-2xl rounded-[2.5rem] p-6 border border-white/10 shadow-2xl animate-in fade-in slide-in-from-right-10 duration-700">
         <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-full text-black">
                    <Sparkles size={18} />
                </div>
                <h2 className="text-lg font-bold text-white">Diseñar</h2>
            </div>
            <button 
                onClick={saveDesign}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold transition-colors border border-white/10"
            >
                <Save size={14} />
                Guardar
            </button>
         </div>

         {/* Simple Tabs for Desktop */}
         <div className="flex gap-2 mb-4 border-b border-white/10 pb-4 overflow-x-auto no-scrollbar">
             <button onClick={() => setActiveMobileTool(null)} className={`px-3 py-1 rounded-full text-xs font-bold ${activeMobileTool === null ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>Texto</button>
             <button onClick={() => setActiveMobileTool('bg')} className={`px-3 py-1 rounded-full text-xs font-bold ${activeMobileTool === 'bg' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>Fondo</button>
             <button onClick={() => setActiveMobileTool('filters')} className={`px-3 py-1 rounded-full text-xs font-bold ${activeMobileTool === 'filters' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>Filtros</button>
             <button onClick={() => setActiveMobileTool('stickers')} className={`px-3 py-1 rounded-full text-xs font-bold ${activeMobileTool === 'stickers' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>Stickers</button>
             <button onClick={() => setActiveMobileTool('gifs')} className={`px-3 py-1 rounded-full text-xs font-bold ${activeMobileTool === 'gifs' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>GIFs</button>
         </div>

         <div className="space-y-6 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar relative min-h-[300px]">
            
            {activeMobileTool === 'stickers' && renderStickersTool()}
            {activeMobileTool === 'gifs' && renderGifsTool()}
            {activeMobileTool === 'filters' && renderFiltersTool()}
            {activeMobileTool === 'sharpen' && renderSharpenTool()}
            
            {activeMobileTool === 'bg' ? (
                isGradientMode ? renderGradientEngineUI() : (
                    <div className="space-y-4 animate-in fade-in">
                        {/* Overlay Opacity Slider */}
                        <div className="mt-4">
                            <GlassSlider 
                                label="Oscuridad del Fondo"
                                min={0} max={100}
                                value={bgOverlayOpacity}
                                onChange={(val) => setBgOverlayOpacity(val)}
                            />
                        </div>

                        <button onClick={() => setIsGradientMode(true)} className="w-full flex items-center justify-center gap-2 p-4 border border-white/30 rounded-full text-white hover:border-white transition-all">
                            <Sparkles size={18} /> Generar Gradiente Smart
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 p-4 bg-white/5 rounded-full text-white hover:bg-white/10">
                            <Upload size={18} /> Subir Imagen
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        
                        <div className="pt-4 border-t border-white/10">
                           <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Pexels Stock</label>
                           <div className="flex gap-2 mb-2">
                               <input 
                                  value={pexelsQuery} onChange={(e) => setPexelsQuery(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && searchPexels()}
                                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/50" placeholder="Buscar..."
                                />
                               <button onClick={searchPexels} className="p-2 bg-white/10 rounded-lg text-white"><Search size={18}/></button>
                           </div>
                           <div className="grid grid-cols-3 gap-2">
                               {pexelsResults.map((src, i) => (
                                   <button key={i} onClick={() => { setBgImage(src); setBgType('image'); }} className="aspect-square rounded-lg overflow-hidden bg-white/5 hover:ring-2 ring-white transition-all">
                                       <img src={src} className="w-full h-full object-cover" />
                                   </button>
                               ))}
                           </div>
                        </div>
                    </div>
                )
            ) : (activeMobileTool !== 'stickers' && activeMobileTool !== 'gifs' && activeMobileTool !== 'filters' && activeMobileTool !== 'sharpen') && (
                <>
                    <div className="space-y-2 animate-in fade-in">
                        <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Versículo</label>
                        <textarea 
                            value={text} onChange={(e) => setText(e.target.value)} rows={3}
                            className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-white focus:outline-none"
                        />
                    </div>
                    <div className="space-y-2 animate-in fade-in">
                        <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Referencia</label>
                        <input 
                            type="text" value={reference} onChange={(e) => setReference(e.target.value)}
                            className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-white focus:outline-none"
                        />
                    </div>
                    
                    {/* Text Opacity Slider */}
                    <div className="mt-4 animate-in fade-in">
                        <GlassSlider 
                            label="Opacidad del Texto"
                            min={0} max={100}
                            value={textOpacity}
                            onChange={(val) => setTextOpacity(val)}
                        />
                    </div>

                    <div className="space-y-2 animate-in fade-in">
                        <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Tipografía</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {FONTS.map((font, idx) => (
                                <button
                                    key={font.name} onClick={() => setFontIndex(idx)}
                                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm border transition-all ${fontIndex === idx ? 'bg-white text-black border-white' : 'bg-white/5 text-gray-300 border-white/10'}`}
                                    style={{ fontFamily: font.family }}
                                >
                                    {font.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
         </div>

         <div className="pt-6 mt-2 border-t border-white/10 animate-in fade-in duration-500">
             {renderDownloadButton()}
             <p className="text-center text-xs text-gray-500 mt-3">
                 {downloadMode === 'png' ? 'Formato PNG de alta calidad' : 'Video renderizado (Simulado)'}
             </p>
         </div>
      </div>
    </div>
  );

  return (
    <>
      {renderMobileEditor()}
      {renderDesktopEditor()}
    </>
  );
};