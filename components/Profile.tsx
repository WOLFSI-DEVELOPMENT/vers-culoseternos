import React, { useState } from 'react';
import { SavedDesign, VerseCardData } from '../types';
import { Grid, Settings, Bookmark, Heart } from 'lucide-react';

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

interface ProfileProps {
  designs: SavedDesign[];
  favorites: VerseCardData[];
}

export const Profile: React.FC<ProfileProps> = ({ designs, favorites }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 px-4 py-8 mb-8 border-b border-white/10">
        {/* Avatar */}
        <div className="w-24 h-24 md:w-36 md:h-36 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px]">
          <div className="w-full h-full rounded-full bg-black border-4 border-black flex items-center justify-center overflow-hidden">
             <span className="text-4xl">👤</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold text-white">usuario_creativo</h2>
            <div className="flex gap-2">
                <button className="px-4 py-1.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                Editar perfil
                </button>
                <button className="p-1.5 text-white hover:bg-white/10 rounded-lg transition-colors">
                <Settings size={20} />
                </button>
            </div>
          </div>

          <div className="flex justify-center md:justify-start gap-8 mb-4 text-sm md:text-base">
            <div className="flex flex-col md:flex-row gap-1 items-center">
                <span className="font-bold text-white">{designs.length}</span>
                <span className="text-gray-400">publicaciones</span>
            </div>
            <div className="flex flex-col md:flex-row gap-1 items-center">
                <span className="font-bold text-white">128</span>
                <span className="text-gray-400">seguidores</span>
            </div>
             <div className="flex flex-col md:flex-row gap-1 items-center">
                <span className="font-bold text-white">45</span>
                <span className="text-gray-400">seguidos</span>
            </div>
          </div>

          <div className="text-sm">
            <h3 className="font-bold text-white">Amante de la Palabra</h3>
            <p className="text-gray-300">Creando versículos eternos para compartir luz. ✨</p>
            <p className="text-blue-400 hover:underline cursor-pointer">versiculoseternos.app</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-12 border-t border-white/10 -mt-px">
        <button 
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 py-4 border-t ${activeTab === 'posts' ? 'border-white text-white' : 'border-transparent text-gray-500'} text-xs font-bold tracking-widest uppercase transition-colors`}
        >
            <Grid size={12} /> Publicaciones
        </button>
        <button 
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 py-4 border-t ${activeTab === 'saved' ? 'border-white text-white' : 'border-transparent text-gray-500'} text-xs font-bold tracking-widest uppercase transition-colors`}
        >
            <Bookmark size={12} /> Guardados
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[300px]">
          {activeTab === 'posts' && (
             designs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center mb-4">
                        <Grid size={32} className="text-white/20" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Aún no hay publicaciones</h3>
                    <p className="text-gray-500 max-w-xs mx-auto">
                        Crea tus propios diseños de versículos y guárdalos para verlos aquí.
                    </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1 md:gap-4 px-1 md:px-0">
                    {designs.map((design) => (
                        <div key={design.id} className="aspect-[9/16] relative group overflow-hidden bg-gray-900 rounded-sm md:rounded-lg">
                             {/* Mini Preview Render */}
                            <div 
                                className="w-full h-full flex flex-col items-center justify-center p-2 text-center"
                                style={{
                                    background: design.bgType === 'gradient' ? design.gradient : 'transparent',
                                }}
                            >
                                 {design.bgType === 'image' && design.bgImage && (
                                    <img 
                                        src={design.bgImage} 
                                        alt="Background" 
                                        className="absolute inset-0 w-full h-full object-cover" 
                                    />
                                )}
                                <div className="relative z-10 scale-[0.35] w-[300%]"> 
                                    <h2 
                                        className="text-3xl font-bold mb-2 text-white drop-shadow-md"
                                        style={{ fontFamily: FONTS[design.fontIndex].family }}
                                    >
                                        {design.text.length > 50 ? design.text.substring(0, 50) + '...' : design.text}
                                    </h2>
                                    <p className="text-sm text-white/90 uppercase font-sans font-bold">
                                        {design.reference}
                                    </p>
                                </div>
                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                     <div className="flex gap-4 text-white font-bold">
                                        <span>❤️ 0</span>
                                        <span>💬 0</span>
                                     </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
              )
          )}

          {activeTab === 'saved' && (
              favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center mb-4">
                        <Bookmark size={32} className="text-white/20" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Guardados</h3>
                    <p className="text-gray-500 max-w-xs mx-auto">
                        Guarda tus versículos favoritos de la comunidad o de la galería para verlos aquí.
                    </p>
                </div>
              ) : (
                 <div className="grid grid-cols-3 gap-1 md:gap-4 px-1 md:px-0">
                    {favorites.map((verse) => (
                        <div key={`prof-fav-${verse.id}`} className="aspect-[9/16] relative group overflow-hidden bg-gray-900 rounded-sm md:rounded-lg">
                            <img 
                                src={verse.imageUrl} 
                                className="w-full h-full object-cover opacity-70"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/40" />
                            <div className="absolute inset-0 flex items-center justify-center p-2 text-center">
                                <h3 className="text-xs font-serif text-white line-clamp-4 leading-tight">
                                    "{verse.text}"
                                </h3>
                            </div>
                            <div className="absolute bottom-2 left-2 right-2 text-[10px] text-gray-300 uppercase tracking-widest text-center">
                                {verse.reference}
                            </div>
                        </div>
                    ))}
                 </div>
              )
          )}
      </div>
    </div>
  );
};