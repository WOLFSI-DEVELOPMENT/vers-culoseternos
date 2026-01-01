import React, { useState, useRef } from 'react';
import { VerseCardData } from '../types';
import { Share2, Heart, Download, X, ExternalLink } from 'lucide-react';
import html2canvas from 'html2canvas';

interface VerseCardProps {
  data: VerseCardData;
  isFavorite: boolean;
  onToggleFavorite: (data: VerseCardData) => void;
}

export const VerseCard: React.FC<VerseCardProps> = ({ data, isFavorite, onToggleFavorite }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Function to handle High Quality Download
  const executeDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setShowSupportModal(false);

    // Create a temporary hidden container for high-res rendering
    // Note: We deliberately do not add border-radius to the container style to ensure square downloads.
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '1080px'; // High Quality Width
    container.style.height = '1920px'; // High Quality Height (9:16)
    container.style.zIndex = '-1';
    
    // Render HTML structure into container
    container.innerHTML = `
        <div style="position: relative; width: 100%; height: 100%; overflow: hidden; background-color: #111;">
            <img src="${data.imageUrl}" style="position: absolute; width: 100%; height: 100%; object-fit: cover; opacity: 0.8;" />
            <div style="position: absolute; inset: 0; background-color: rgba(0,0,0,0.4);"></div>
            <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 120px 80px; display: flex; flex-direction: column; justify-content: flex-end;">
                <h1 style="color: white; font-family: 'Merriweather', serif; font-weight: 700; font-size: 80px; line-height: 1.2; text-shadow: 0 4px 20px rgba(0,0,0,0.5); margin-bottom: 40px;">
                    “${data.text}”
                </h1>
                 <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-family: sans-serif; color: white; background-color: rgba(255,255,255,0.2); padding: 15px 40px; border-radius: 50px; font-size: 24px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">
                        ${data.reference}
                    </span>
                    <span style="color: rgba(255,255,255,0.6); font-family: sans-serif; text-transform: uppercase; letter-spacing: 3px; font-size: 20px;">
                        Versículos Eternos
                    </span>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(container);

    try {
        // Wait for image to load if needed (though src is cached usually)
        const img = container.querySelector('img');
        if (img && !img.complete) {
             await new Promise((resolve) => { img.onload = resolve; });
        }

        const canvas = await html2canvas(container, {
            scale: 1, // Already set to HD dimensions
            useCORS: true,
            backgroundColor: null
        });

        const link = document.createElement('a');
        link.download = `versiculo-${data.reference.replace(/\s/g, '-')}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (err) {
        console.error("Download failed", err);
    } finally {
        document.body.removeChild(container);
        setIsDownloading(false);
    }
  };

  const initiateDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSupportModal(true);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Construct share data
    const shareData = {
        title: 'Versículos Eternos',
        text: `"${data.text}" - ${data.reference} 🕊️`,
        url: window.location.href // Or a specific deep link if implemented
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.error('Error al compartir:', err);
        }
    } else {
        // Fallback for browsers without share API
        navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Versículo copiado al portapapeles');
    }
  };

  const renderSupportModal = () => {
    if (!showSupportModal) return null;

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={(e) => { e.stopPropagation(); setShowSupportModal(false); }}
        >
            <div 
                className="bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                <button 
                    onClick={() => setShowSupportModal(false)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-white"
                >
                    <X size={20} />
                </button>
                
                <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                        <Heart size={32} className="text-red-500 fill-current animate-pulse" />
                    </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">Mantén viva la App</h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    Tu apoyo nos ayuda a seguir inspirando al mundo. ¡Gracias por ser parte de esto!
                </p>

                <div className="space-y-3 mb-6">
                    <a 
                        href="https://venmo.com/u/rocioramirezpena" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 border border-[#008CFF] rounded-full hover:bg-[#008CFF] transition-colors group text-[#008CFF] hover:text-white"
                    >
                        <div className="flex items-center gap-3 w-full justify-center">
                            <span className="font-bold">Donate</span>
                        </div>
                    </a>
                    
                    <a 
                        href="https://www.tiktok.com/@rocioramirezpena" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 border border-white rounded-full hover:bg-white transition-colors group text-white hover:text-black"
                    >
                        <div className="flex items-center gap-3 w-full justify-center">
                            <span className="font-bold">Follow</span>
                        </div>
                    </a>
                </div>

                <button 
                    onClick={executeDownload}
                    className="w-full py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors"
                >
                    Continuar a Descargar
                </button>
                <div className="mt-3 text-[10px] text-gray-500">
                    @rocioramirezpena
                </div>
            </div>
        </div>
    );
  };

  return (
    <>
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
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0">
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(data); }}
                    className={`p-2 rounded-full backdrop-blur-md transition-colors ${isFavorite ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    title={isFavorite ? "Eliminar de favoritos" : "Añadir a favoritos"}
                >
                    <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
                </button>
                
                <button 
                    onClick={initiateDownload}
                    className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition-colors"
                    title="Descargar HD (9:16)"
                >
                    {isDownloading ? <span className="w-4 h-4 block rounded-full border-2 border-white/50 border-t-white animate-spin"/> : <Download size={18} />}
                </button>

                <button 
                    onClick={handleShare}
                    className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition-colors"
                    title="Compartir"
                >
                    <Share2 size={18} />
                </button>
                </div>
            </div>
            </div>
        </div>
        </div>
        {renderSupportModal()}
    </>
  );
};