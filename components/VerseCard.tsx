import React, { useState } from 'react';
import { VerseCardData } from '../types';
import { Share2, Heart } from 'lucide-react';

interface VerseCardProps {
  data: VerseCardData;
  isFavorite: boolean;
  onToggleFavorite: (data: VerseCardData) => void;
}

export const VerseCard: React.FC<VerseCardProps> = ({ data, isFavorite, onToggleFavorite }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className={`relative mb-6 break-inside-avoid rounded-3xl overflow-hidden group cursor-zoom-in transition-transform duration-300 hover:-translate-y-1 transform-gpu`}>
      {/* Background Image */}
      <div className={`relative w-full ${data.heightClass} bg-gray-900`}>
        <img
          src={data.imageUrl}
          alt={data.reference}
          className={`w-full h-full object-cover transition-opacity duration-700 ${imageLoaded ? 'opacity-70' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
        {/* Solid Overlay */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <div className="transform transition-transform duration-500 ease-out translate-y-2 group-hover:translate-y-0">
          <p className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
            {data.book_name}
          </p>
          <h3 className="text-xl md:text-2xl font-serif font-bold text-white leading-tight mb-3 drop-shadow-lg">
            “{data.text}”
          </h3>
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm font-semibold text-gray-300 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
              {data.reference}
            </span>
            
            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0">
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(data); }}
                className={`p-2 rounded-full backdrop-blur-md transition-colors ${isFavorite ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
                title={isFavorite ? "Eliminar de favoritos" : "Añadir a favoritos"}
              >
                <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
              </button>
              <button className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition-colors">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};