import React, { useEffect, useState, useRef, useCallback } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { fetchRandomChapterVerses } from './services/bibleService';
import { VerseCardData, Verse, SavedDesign, User } from './types';
import { VerseCard } from './components/VerseCard';
import { CreateEditor } from './components/CreateEditor';
import { Profile } from './components/Profile';
import { Auth } from './components/Auth';
import { CARD_HEIGHTS } from './constants';
import { Loader2, Search, Home, Heart, Compass, BookmarkX, PlusCircle, Rocket, MessageCircle, Share2, Bookmark } from 'lucide-react';

const GOOGLE_CLIENT_ID = '7302993140-qgo9bovj97d11d68q7hje32da15bvm14.apps.googleusercontent.com';

const getRandomHeight = () => CARD_HEIGHTS[Math.floor(Math.random() * CARD_HEIGHTS.length)];
const getRandomImage = (id: string) => `https://picsum.photos/seed/${id}/400/600`;

// Custom Community Icon Component
const CommunityIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    viewBox="0 0 16 16" 
    fill="currentColor" 
    stroke="currentColor" 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    className={className}
    style={{ overflow: 'visible' }}
  >
    <path d="M1.3333333333333333 14.666666666666666c0 -2.9455333333333336 2.387813333333333 -5.333333333333333 5.333333333333333 -5.333333333333333 2.9455333333333336 0 5.333333333333333 2.3878 5.333333333333333 5.333333333333333h-1.3333333333333333c0 -2.209133333333333 -1.7908666666666666 -4 -4 -4 -2.2091399999999997 0 -4 1.7908666666666666 -4 4H1.3333333333333333Zm5.333333333333333 -6c-2.21 0 -4 -1.79 -4 -4s1.79 -4 4 -4 4 1.79 4 4 -1.79 4 -4 4Zm0 -1.3333333333333333c1.4733333333333332 0 2.6666666666666665 -1.1933333333333334 2.6666666666666665 -2.6666666666666665s-1.1933333333333334 -2.6666666666666665 -2.6666666666666665 -2.6666666666666665 -2.6666666666666665 1.1933333333333334 -2.6666666666666665 2.6666666666666665 1.1933333333333334 2.6666666666666665 2.6666666666666665 2.6666666666666665Zm5.522466666666666 2.4685333333333332C14.042933333333332 10.6374 15.333333333333332 12.501333333333331 15.333333333333332 14.666666666666666h-1.3333333333333333c0 -1.6239999999999999 -0.9678 -3.021933333333333 -2.358133333333333 -3.6486l0.5472666666666666 -1.2162Zm-0.4583333333333333 -7.526393333333333C13.062933333333334 2.8246866666666666 14 4.13574 14 5.666666666666666c0 1.9134666666666666 -1.4638666666666666 3.4834666666666667 -3.333333333333333 3.651733333333333v-1.3419999999999999c1.1311333333333333 -0.1616 2 -1.1337333333333333 2 -2.309733333333333 0 -0.9204333333333332 -0.5322666666666667 -1.71598 -1.306 -2.0957666666666666l0.3701333333333333 -1.2954266666666667Z" strokeWidth="1.2"></path>
  </svg>
);

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [verses, setVerses] = useState<VerseCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  
  // Explore State
  const [exploreSubTab, setExploreSubTab] = useState<'posts' | 'verses'>('verses');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Favorites State
  const [favorites, setFavorites] = useState<VerseCardData[]>(() => {
    try {
      const saved = localStorage.getItem('favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load favorites", e);
      return [];
    }
  });

  // Saved Designs State
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>(() => {
    try {
        const saved = localStorage.getItem('savedDesigns');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error("Failed to load designs", e);
        return [];
    }
  });

  const observerTarget = useRef<HTMLDivElement>(null);

  // Sync favorites
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Sync saved designs
  useEffect(() => {
    localStorage.setItem('savedDesigns', JSON.stringify(savedDesigns));
  }, [savedDesigns]);

  // Handle Login
  const handleLoginSuccess = (userData: User) => {
      setUser(userData);
      setIsAuthenticated(true);
  };

  const toggleFavorite = (verse: VerseCardData) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.reference === verse.reference && f.text === verse.text);
      if (exists) {
        return prev.filter(f => !(f.reference === verse.reference && f.text === verse.text));
      }
      return [...prev, verse];
    });
  };

  const isFavorite = (verse: VerseCardData) => {
    return favorites.some(f => f.reference === verse.reference && f.text === verse.text);
  };

  const handleSaveDesign = (design: SavedDesign) => {
    setSavedDesigns(prev => [design, ...prev]);
  };

  const loadMoreVerses = useCallback(async () => {
    if (loading || (activeTab !== 'home' && activeTab !== 'explore')) return;
    setLoading(true);

    try {
      const minDelay = new Promise(resolve => setTimeout(resolve, 600));
      const [newVerses] = await Promise.all([fetchRandomChapterVerses(), minDelay]);

      const processedVerses: VerseCardData[] = newVerses.map(v => ({
        ...v,
        imageUrl: getRandomImage(v.id),
        heightClass: getRandomHeight()
      }));

      setVerses(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const uniqueNew = processedVerses.filter(v => !existingIds.has(v.id));
        return [...prev, ...uniqueNew];
      });
    } catch (error) {
      console.error("Failed to load verses", error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [loading, activeTab]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'home' && verses.length === 0) {
      loadMoreVerses();
    }
    if (isAuthenticated && activeTab === 'explore' && verses.length === 0) {
        loadMoreVerses();
    }
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    if (activeTab !== 'home' && activeTab !== 'explore') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreVerses();
        }
      },
      { threshold: 0.1, rootMargin: '1000px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMoreVerses, activeTab]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node) && isSearchExpanded) {
        setIsSearchExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchExpanded]);


  const renderContent = () => {
    if (activeTab === 'create') {
        return <CreateEditor onBack={() => setActiveTab('home')} onSaveDesign={handleSaveDesign} />;
    }

    if (activeTab === 'profile') {
        return user ? (
            <Profile 
                designs={savedDesigns} 
                favorites={favorites} 
                user={user} 
                onUpdateUser={setUser}
            /> 
        ) : null;
    }

    if (activeTab === 'home') {
      return (
        <>
          {initialLoad && verses.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
              <Loader2 className="w-10 h-10 text-white animate-spin mb-4" />
              <p className="text-gray-500 text-sm">Preparando inspiración...</p>
            </div>
          )}

          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6 space-y-6">
            {verses.map((verse) => (
              <VerseCard 
                key={verse.id} 
                data={verse} 
                isFavorite={isFavorite(verse)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>

          <div 
            ref={observerTarget} 
            className="h-32 flex items-center justify-center w-full mt-10"
          >
            {loading && verses.length > 0 && (
              <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">Cargando más</span>
              </div>
            )}
          </div>
        </>
      );
    }

    if (activeTab === 'explore') {
        return (
            <div className="w-full flex flex-col items-center h-[calc(100vh-80px)] md:h-screen">
                
                {/* STICKY HEADER */}
                <div className="sticky top-0 z-40 w-full flex justify-center bg-black/80 backdrop-blur-md pt-4 pb-2 -mt-4">
                    <div className="w-full max-w-sm rounded-full py-1 flex items-center justify-center relative h-16">
                        {/* Switcher Pill */}
                        <div 
                            className={`absolute flex p-1 bg-white/10 rounded-full backdrop-blur-md transition-all duration-300 transform ${isSearchExpanded ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}
                        >
                            <button 
                                onClick={() => setExploreSubTab('posts')}
                                className={`px-6 py-2 rounded-full text-xs font-bold uppercase transition-all duration-300 ${exploreSubTab === 'posts' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                            >
                                Posts
                            </button>
                            <button 
                                onClick={() => setExploreSubTab('verses')}
                                className={`px-6 py-2 rounded-full text-xs font-bold uppercase transition-all duration-300 ${exploreSubTab === 'verses' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                            >
                                Biblia
                            </button>
                        </div>
                        
                        {/* Animated Search Button/Bar */}
                        <div 
                            ref={searchInputRef as any}
                            className={`bg-white/10 backdrop-blur-md rounded-full flex items-center transition-all duration-500 ease-apple absolute right-4 ${isSearchExpanded ? 'w-full right-0 left-0 mx-4 pl-4 pr-1 bg-black/90 border border-white/20 h-12' : 'w-12 h-12 justify-center hover:bg-white/20 cursor-pointer'}`}
                            onClick={() => !isSearchExpanded && setIsSearchExpanded(true)}
                        >
                            <Search size={20} className="text-white shrink-0" />
                            <input 
                                type="text" 
                                placeholder="Buscar..."
                                className={`bg-transparent border-none outline-none text-white text-sm ml-2 w-full ${isSearchExpanded ? 'opacity-100' : 'opacity-0 w-0 pointer-events-none'}`}
                                autoFocus={isSearchExpanded}
                            />
                            {isSearchExpanded && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setIsSearchExpanded(false); }}
                                    className="p-2 text-gray-400 hover:text-white"
                                >
                                    <BookmarkX size={20} className="rotate-45" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {exploreSubTab === 'posts' ? (
                     <div className="flex flex-col items-center justify-center flex-1 w-full text-center animate-in fade-in">
                        <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center mb-6">
                            <Rocket size={32} className="text-purple-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Comunidad</h2>
                        <p className="text-gray-500">Próximamente disponible.</p>
                    </div>
                ) : (
                    <>
                        {/* Mobile: Grid Layout */}
                        <div className="md:hidden w-full columns-1 sm:columns-2 gap-4 space-y-4 px-2 pb-20 animate-in fade-in pt-4">
                            {verses.map((verse) => (
                                <div key={verse.id + '-explore-mob'} className="relative break-inside-avoid aspect-[9/16] rounded-2xl overflow-hidden bg-gray-900 group">
                                    <img src={verse.imageUrl} className="w-full h-full object-cover" loading="lazy" />
                                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                                    
                                    <div className="absolute bottom-16 right-2 flex flex-col items-center gap-4 z-20">
                                        <div className="flex flex-col items-center gap-1">
                                            <button className="p-2 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"><Heart size={20} /></button>
                                            <span className="text-[10px] font-bold">8.5k</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <button className="p-2 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"><MessageCircle size={20} /></button>
                                            <span className="text-[10px] font-bold">124</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <button onClick={(e) => {e.stopPropagation(); toggleFavorite(verse)}} className={`p-2 bg-black/40 backdrop-blur-sm rounded-full transition-colors ${isFavorite(verse) ? 'text-yellow-400' : 'text-white'}`}><Bookmark size={20} fill={isFavorite(verse) ? "currentColor" : "none"} /></button>
                                            <span className="text-[10px] font-bold">Guardar</span>
                                        </div>
                                        <button className="p-2 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"><Share2 size={20} /></button>
                                    </div>
                                    
                                    <div className="absolute bottom-0 left-0 right-14 p-4 z-10 bg-gradient-to-t from-black/80 to-transparent pt-12">
                                        <h3 className="text-white font-serif font-bold text-lg leading-snug line-clamp-4 mb-2">"{verse.text}"</h3>
                                        <p className="text-xs text-gray-300 font-bold uppercase tracking-wider">{verse.reference}</p>
                                    </div>
                                </div>
                            ))}
                             {/* Infinite Scroll Trigger for Mobile Explore */}
                            <div ref={observerTarget} className="h-20 w-full" />
                        </div>

                        {/* Desktop/Tablet: TikTok Style Single Feed */}
                        <div className="hidden md:flex flex-col items-center w-full h-[85vh] overflow-y-scroll snap-y snap-mandatory no-scrollbar pb-20">
                            {verses.map((verse) => (
                                <div key={verse.id + '-explore-desk'} className="snap-center w-full h-full flex items-center justify-center relative shrink-0 py-8">
                                    <div className="relative aspect-[9/16] h-full max-h-[80vh] rounded-3xl overflow-hidden bg-gray-900 shadow-2xl">
                                        <img src={verse.imageUrl} className="w-full h-full object-cover" loading="lazy" />
                                        <div className="absolute inset-0 bg-black/20" />
                                        
                                        <div className="absolute bottom-0 left-0 right-0 p-8 z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-32">
                                            <h3 className="text-white font-serif font-bold text-3xl leading-tight mb-4 drop-shadow-lg">"{verse.text}"</h3>
                                            <p className="text-sm text-gray-300 font-bold uppercase tracking-widest bg-white/10 inline-block px-3 py-1 rounded-full backdrop-blur-md">{verse.reference}</p>
                                        </div>
                                    </div>

                                    {/* Floating Actions Outside Right */}
                                    <div className="absolute right-[calc(50%-280px)] top-1/2 -translate-y-1/2 flex flex-col gap-6 ml-8">
                                        <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                            <div className="p-4 bg-gray-800 rounded-full text-white group-hover:bg-gray-700 transition-colors shadow-lg">
                                                <Heart size={28} />
                                            </div>
                                            <span className="text-xs font-bold text-gray-400">8.5k</span>
                                        </div>
                                        
                                        <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                            <div className="p-4 bg-gray-800 rounded-full text-white group-hover:bg-gray-700 transition-colors shadow-lg">
                                                <MessageCircle size={28} />
                                            </div>
                                            <span className="text-xs font-bold text-gray-400">124</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); toggleFavorite(verse); }}
                                                className={`p-4 rounded-full transition-colors shadow-lg ${isFavorite(verse) ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                                            >
                                                <Bookmark size={28} fill={isFavorite(verse) ? "currentColor" : "none"} />
                                            </button>
                                            <span className="text-xs font-bold text-gray-400">Guardar</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                             <div className="p-4 bg-gray-800 rounded-full text-white group-hover:bg-gray-700 transition-colors shadow-lg">
                                                <Share2 size={28} />
                                            </div>
                                            <span className="text-xs font-bold text-gray-400">Share</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                             {/* Infinite Scroll Trigger for Desktop Explore */}
                            <div ref={observerTarget} className="h-10 w-full" />
                        </div>
                    </>
                )}
            </div>
        );
    }

    if (activeTab === 'community') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
            <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center mb-6">
              <CommunityIcon size={32} className="text-gray-700" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Comunidad</h2>
            <p className="text-gray-400 max-w-sm">
              Pronto podrás conectar con otros creadores.
            </p>
        </div>
      );
    }

    return null;
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {!isAuthenticated ? (
          <Auth onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-gray-700 selection:text-white">
          
          {/* --- DESKTOP SIDEBAR --- */}
          <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-24 flex-col items-center justify-center gap-12 z-50">
            <div className="absolute top-10">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg shadow-white/5">
                  <span className="text-sm font-bold text-black">V</span>
                </div>
            </div>
            
            <nav className="flex flex-col items-center gap-10">
              <button 
                onClick={() => setActiveTab('home')} 
                className={`transition-transform hover:scale-110 ${activeTab === 'home' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                title="Inicio"
              >
                <Home size={28} strokeWidth={3} />
              </button>
              
              <button 
                onClick={() => setActiveTab('explore')} 
                className={`transition-transform hover:scale-110 ${activeTab === 'explore' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                title="Explorar"
              >
                <Compass size={28} strokeWidth={3} />
              </button>

              <button 
                onClick={() => setActiveTab('create')} 
                className={`transition-transform hover:scale-110 ${activeTab === 'create' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                title="Crear"
              >
                <PlusCircle size={32} strokeWidth={3} fill={activeTab === 'create' ? "white" : "none"} className={activeTab === 'create' ? 'text-black' : ''} />
              </button>

              <button 
                onClick={() => setActiveTab('community')} 
                className={`transition-transform hover:scale-110 ${activeTab === 'community' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                title="Comunidad"
              >
                <CommunityIcon size={28} />
              </button>

              <button 
                onClick={() => setActiveTab('profile')} 
                className={`transition-transform hover:scale-110 ${activeTab === 'profile' ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                title="Perfil"
              >
                  <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-current flex items-center justify-center overflow-hidden">
                    {user?.picture ? <img src={user.picture} alt="User" className="w-full h-full object-cover" /> : <span className="text-[10px]">👤</span>}
                  </div>
              </button>
            </nav>
          </aside>

          {/* --- MOBILE TOP HEADER --- */}
          {activeTab !== 'create' && activeTab !== 'explore' && (
            <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10 h-14 flex items-center justify-center px-4 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <span className="text-xs font-bold text-black">V</span>
                  </div>
                  <h1 className="text-base font-bold text-white tracking-wide">VERSÍCULOS</h1>
                </div>
            </header>
          )}

          {/* --- MOBILE BOTTOM NAV --- */}
          {activeTab !== 'create' && (
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-white/10 h-16 px-4 flex justify-between items-center pb-1 safe-area-pb">
              <button 
                onClick={() => setActiveTab('home')} 
                className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' ? 'text-white' : 'text-gray-600'}`}
              >
                  <Home size={20} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
                  <span className="text-[10px] font-medium">Inicio</span>
              </button>
              <button 
                onClick={() => setActiveTab('explore')} 
                className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'explore' ? 'text-white' : 'text-gray-600'}`}
              >
                  <Compass size={20} strokeWidth={activeTab === 'explore' ? 2.5 : 2} />
                  <span className="text-[10px] font-medium">Explorar</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('create')} 
                className={`flex flex-col items-center justify-center -mt-6`}
              >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-black transition-all ${activeTab === 'create' ? 'bg-white text-black' : 'bg-gray-800 text-white'}`}>
                      <PlusCircle size={24} strokeWidth={2.5} />
                  </div>
              </button>

              <button 
                onClick={() => setActiveTab('community')} 
                className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'community' ? 'text-white' : 'text-gray-600'}`}
              >
                <CommunityIcon size={20} />
                  <span className="text-[10px] font-medium">Comunidad</span>
              </button>
              <button 
                onClick={() => setActiveTab('profile')} 
                className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-white' : 'text-gray-600'}`}
              >
                  <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center overflow-hidden">
                    {user?.picture ? <img src={user.picture} alt="User" className="w-full h-full object-cover" /> : <span className="text-[8px]">👤</span>}
                  </div>
                  <span className="text-[10px] font-medium">Perfil</span>
              </button>
            </nav>
          )}

          {/* --- MAIN CONTENT --- */}
          <main className={`${activeTab === 'create' ? 'pt-0 px-0 pb-0 md:pt-10 md:pb-10 md:px-4' : (activeTab === 'explore' ? 'pt-4 px-2 pb-24 md:pt-10 md:px-4' : 'pt-20 pb-24 px-4 md:pt-10 md:pb-10')} md:pl-32 md:pr-8 max-w-[1800px] mx-auto min-h-screen`}>
            {renderContent()}
          </main>

          {/* Footer / Scroll to Top (Only show on Home) */}
          {activeTab !== 'create' && activeTab === 'home' && (
            <div className="fixed bottom-20 right-4 md:bottom-10 md:right-10 z-40">
              <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/10 flex items-center justify-center text-white transition-all shadow-lg"
                  title="Volver arriba"
              >
                ↑
              </button>
            </div>
          )}

        </div>
      )}
    </GoogleOAuthProvider>
  );
}

export default App;