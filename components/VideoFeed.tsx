import React, { useState, useEffect } from 'react';
import { YouTubeVideo } from '../types';
import { Loader2, PlayCircle, ExternalLink } from 'lucide-react';

interface VideoFeedProps {
  apiKey: string;
  searchQuery?: string;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({ apiKey, searchQuery }) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const q = query || 'versiculos biblicos inspiradores';
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${encodeURIComponent(q)}&type=video&key=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error('Quota exceeded or API Error');
      }

      const data = await response.json();
      setVideos(data.items);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los videos. Verifica la cuota de la API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(searchQuery || '');
  }, [searchQuery]);

  if (loading && videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 text-white animate-spin mb-4" />
        <p className="text-gray-500 text-sm">Cargando videos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-4">
        <p className="text-red-400 mb-2">{error}</p>
        <button 
            onClick={() => fetchVideos(searchQuery || '')}
            className="px-4 py-2 bg-white/10 rounded-full text-sm font-bold hover:bg-white/20 transition-colors"
        >
            Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-20">
      {videos.map((video) => (
        <a 
          key={video.id.videoId}
          href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 block aspect-video sm:aspect-auto sm:h-auto"
        >
          {/* Thumbnail */}
          <div className="relative aspect-video w-full overflow-hidden">
            <img 
              src={video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium.url} 
              alt={video.snippet.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                <PlayCircle size={48} className="text-white drop-shadow-lg" />
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <h3 className="text-white font-bold text-sm line-clamp-2 mb-2 leading-snug">
              {video.snippet.title}
            </h3>
            <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{video.snippet.channelTitle}</span>
                <ExternalLink size={12} />
            </div>
          </div>
        </a>
      ))}
    </div>
  );
};