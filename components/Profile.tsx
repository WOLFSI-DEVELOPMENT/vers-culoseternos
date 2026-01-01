import React, { useState } from 'react';
import { SavedDesign, VerseCardData, User } from '../types';
import { Grid, Settings, Bookmark, Check, X, Camera, LogOut, Share2 } from 'lucide-react';

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
  user: User;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ designs, favorites, user, onUpdateUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<User>(user);

  const handleSaveProfile = () => {
    onUpdateUser(editForm);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditForm(user);
    setIsEditing(false);
  };

  const handleShareDesign = async (e: React.MouseEvent, design: SavedDesign) => {
    e.stopPropagation();
    const shareData = {
        title: 'Mi Diseño - Versículos Eternos',
        text: `"${design.text}" - ${design.reference} 🎨`,
        url: window.location.href
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.error('Error sharing:', err);
        }
    } else {
        navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Copiado al portapapeles');
    }
  };

  if (isEditing) {
      return (
          <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 animate-in fade-in">
              <div className="w-full max-w-md bg-zinc-900 rounded-3xl border border-white/10 p-8 shadow-2xl relative">
                  <button onClick={handleCancelEdit} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                      <X size={24} />
                  </button>
                  
                  <h2 className="text-2xl font-bold text-white mb-6 text-center">Editar Perfil</h2>
                  
                  <div className="flex flex-col items-center mb-6 relative group">
                        <div className="w-24 h-24 rounded-full border-2 border-white/20 p-1 mb-2">
                             <img src={editForm.picture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                        </div>
                        <p className="text-xs text-gray-500">Foto de Google (No editable)</p>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-2">Nombre</label>
                          <input 
                              type="text" 
                              value={editForm.name}
                              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-white/50"
                          />
                      </div>
                      <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-2">Usuario</label>
                          <div className="relative">
                              <span className="absolute left-3 top-3 text-gray-400">@</span>
                              <input 
                                  type="text" 
                                  value={editForm.username}
                                  onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-8 text-white focus:outline-none focus:border-white/50"
                              />
                          </div>
                      </div>
                      <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-2">Biografía</label>
                          <textarea 
                              rows={3}
                              value={editForm.bio}
                              onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-white/50"
                          />
                      </div>
                  </div>

                  <button 
                      onClick={handleSaveProfile}
                      className="w-full mt-8 py-3 bg-white text-black rounded-full font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                  >
                      <Check size={18} /> Guardar Cambios
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 px-4 py-8 mb-8 border-b border-white/10 relative">
        
        {/* Sign Out Button (Absolute Top Right) */}
        <button 
             onClick={onLogout}
             className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all text-xs font-bold text-gray-400"
        >
            <LogOut size={14} /> Cerrar Sesión
        </button>

        {/* Avatar */}
        <div className="w-24 h-24 md:w-36 md:h-36 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px]">
          <div className="w-full h-full rounded-full bg-black border-4 border-black flex items-center justify-center overflow-hidden">
             {user.picture ? (
                 <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
             ) : (
                 <span className="text-4xl">👤</span>
             )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold text-white">{user.username ? `@${user.username}` : user.name}</h2>
            <div className="flex gap-2">
                <button 
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-1.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
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
          </div>

          <div className="text-sm">
            <h3 className="font-bold text-white">{user.name}</h3>
            <p className="text-gray-300">{user.bio}</p>
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
                                     <div className="flex gap-4 text-white font-bold items-center">
                                        <span>❤️ 0</span>
                                        <button 
                                            onClick={(e) => handleShareDesign(e, design)}
                                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                            title="Compartir"
                                        >
                                            <Share2 size={20} />
                                        </button>
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