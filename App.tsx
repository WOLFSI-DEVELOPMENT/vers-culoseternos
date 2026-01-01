import React, { useEffect, useState, useRef, useCallback } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { fetchRandomChapterVerses } from './services/bibleService';
import { VerseCardData, Verse, SavedDesign, User } from './types';
import { VerseCard } from './components/VerseCard';
import { CreateEditor } from './components/CreateEditor';
import { Profile } from './components/Profile';
import { Auth } from './components/Auth';
import { VideoFeed } from './components/VideoFeed';
import { BibleReader } from './components/BibleReader';
import { CARD_HEIGHTS } from './constants';
import { Loader2, Search, Home, Heart, Compass, BookmarkX, PlusCircle, Rocket, MessageCircle, Share2, Bookmark, Video, Book, Image as ImageIcon } from 'lucide-react';

const GOOGLE_CLIENT_ID = '7302993140-qgo9bovj97d11d68q7hje32da15bvm14.apps.googleusercontent.com';
const YOUTUBE_API_KEY = 'AIzaSyBd5o02cc1ArgEyHPRZZ_H0k0Ro_AqMbcY';

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
    <path d="M1.3333333333333333 14.666666666666666c0 -2.9455333333333336 2.387813333333333 -5.333333333333333 5.333333333333333 -5.333333333333333 2.9455333333333336 0 5.333333333333333 2.3878 5.333333333333333 5.333333333333333h-1.3333333333333333c0 -2.209133333333333 -1.7908666666666666 -4 -4 -4 -2.2091399999999997 0 -4 1.7908666666666666 -4 4H1.3333333333333333Zm5.333333333333333 -6c-2.21 0 -4 -1.79 -4 -4s1.79 -4 4 -4 4 1.79 4 4 -1.79 4 -4 4Zm0 -1.3333333333333333c1.4733333333333332 0 2.6666666666666665 -1.1933333333333334 2.6666666666666665 -2.6666666666666665s-1.1933333333333334 -2.6666666666666665 -2.6666666666666665 -2.6666666666666665 -2.6666666666666665 1.1933333333333334 -2.6666666666666665 2.6666666666666665 1.1933333333333334 2.6666666666666665 2.6666666666666665Zm5.522466666666666 2.4685333333333332C14.042933333333332 10.6374 15.333333333333332 12.501333333333331 15.333333333333332 14.666666666666666h-1.3333333333333333c0 -1.6239999999999999 -0.9678 -3.021933333333333 -2.358133333333333 -3.6486l0.5472666666666666 -1.2162Zm-0.4583333333333333 -7.526393333333333C13.062933333333334 2.8246866666666666 14 4.13574 14 5.666666666666666c0 1.9134666666666666 -1.4638666666666666 3.4834666666666667 -3.333333333333333 3.651733333333333v-1.3419999999999999c1.1311333333333333 -0.1616 2 -1.1337333333333333 2 -2.309733333333333 0 -0.9204333333333332 -0.5322666666666667 -1.71598 -1.306 -2.0957666666666666l0.3701333333333333 -1.2954266666666667Z" strokeWidth="1.2"></path>
  </svg>
);

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [verses, setVerses] = useState<VerseCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('home');
  const [homeSubTab, setHomeSubTab] = useState<'verses' | 'videos' | 'bible'>('verses');
  
  // Explore State
  const [exploreSubTab, setExploreSubTab] = useState<'posts' | 'verses'>('verses');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  
  // Search State for Home
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const homeSearchInputRef = useRef<HTMLInputElement>(null);
  
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

  const handleLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
      setInitialLoad(true);
      setVerses([]);
      setActiveTab('home');
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
    if (activeTab === 'home' && homeSubTab !== 'verses') return; // Only infinite scroll for verses

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
  }, [loadMoreVerses, activeTab, homeSubTab]);

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


  const renderHomeContent = () => {
    return (
      <div className="flex flex-col w-full">
        {/* Home Tab Switcher & Search */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8 sticky top-20 md:top-0 z-30 pt-4 md:pt-0 bg-black/95 md:bg-transparent pb-4 md:pb-6">
            <div className="flex items-center gap-2 p-1">
                <button 
                    onClick={() => setHomeSubTab('verses')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${homeSubTab === 'verses' ? 'bg-white text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
                >
                    <ImageIcon size={16} />
                    Versículos
                </button>
                <button 
                    onClick={() => setHomeSubTab('videos')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${homeSubTab === 'videos' ? 'bg-white text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
                >
                    <Video size={16} />
                    Videos
                </button>
                <button 
                    onClick={() => setHomeSubTab('bible')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${homeSubTab === 'bible' ? 'bg-white text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
                >
                    <Book size={16} />
                    Biblia
                </button>
            </div>
            
            {/* Desktop Home Search */}
            <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 w-64 focus-within:w-80 focus-within:bg-white/10 transition-all duration-300">
                <Search size={18} className="text-gray-400 mr-2" />
                <input 
                    ref={homeSearchInputRef}
                    type="text" 
                    placeholder={homeSubTab === 'videos' ? "Buscar videos..." : "Buscar versículos..."}
                    className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-gray-500"
                    value={homeSearchQuery}
                    onChange={(e) => setHomeSearchQuery(e.target.value)}
                />
            </div>
        </div>

        {/* Content based on subtab */}
        {homeSubTab === 'verses' && (
             <>
                {initialLoad && verses.length === 0 && (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
                        <Loader2 className="w-10 h-10 text-white animate-spin mb-4" />
                        <p className="text-gray-500 text-sm">Preparando inspiración...</p>
                    </div>
                )}

                <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6 space-y-6">
                    {verses
                     .filter(v => !homeSearchQuery || v.text.toLowerCase().includes(homeSearchQuery.toLowerCase()) || v.reference.toLowerCase().includes(homeSearchQuery.toLowerCase()))
                     .map((verse) => (
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
        )}

        {homeSubTab === 'videos' && (
            <VideoFeed apiKey={YOUTUBE_API_KEY} searchQuery={homeSearchQuery} />
        )}

        {homeSubTab === 'bible' && (
            <BibleReader />
        )}
      </div>
    );
  };

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
                onLogout={handleLogout}
            /> 
        ) : null;
    }

    if (activeTab === 'home') {
      return renderHomeContent();
    }

    if (activeTab === 'explore') {
        return (
            <div className="w-full flex flex-col items-center h-[calc(100vh-80px)] md:h-screen">
                
                {/* STICKY HEADER */}
                <div className="sticky top-0 z-40 w-full flex justify-center bg-black/80 backdrop-blur-md pt-4 pb-2 -mt-4">
                    <div className="w-full max-w-sm rounded-full py-1 flex items-center justify-center relative h-16">
                        {/* Switcher Pill */}
                        <div 
                            className={`absolute flex items-center gap-2 p-1 transition-all duration-300 transform ${isSearchExpanded ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}
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

                                    {/* Floating Actions Outside Right (Desktop Updated UI) */}
                                    <div className="absolute right-[calc(50%-280px)] top-1/2 -translate-y-1/2 flex flex-col gap-8 ml-8">
                                        <div className="flex flex-col items-center gap-2 group cursor-pointer transition-transform hover:scale-110">
                                            <Heart size={32} className="text-white drop-shadow-lg hover:text-red-500 transition-colors" />
                                            <span className="text-xs font-bold text-white drop-shadow-md">8.5k</span>
                                        </div>
                                        
                                        <div className="flex flex-col items-center gap-2 group cursor-pointer transition-transform hover:scale-110">
                                            <MessageCircle size={32} className="text-white drop-shadow-lg" />
                                            <span className="text-xs font-bold text-white drop-shadow-md">124</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-2 group cursor-pointer transition-transform hover:scale-110">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); toggleFavorite(verse); }}
                                                className={`transition-colors drop-shadow-lg ${isFavorite(verse) ? 'text-yellow-400' : 'text-white'}`}
                                            >
                                                <Bookmark size={32} fill={isFavorite(verse) ? "currentColor" : "none"} />
                                            </button>
                                            <span className="text-xs font-bold text-white drop-shadow-md">Guardar</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-2 group cursor-pointer transition-transform hover:scale-110">
                                            <Share2 size={32} className="text-white drop-shadow-lg" />
                                            <span className="text-xs font-bold text-white drop-shadow-md">Share</span>
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
                <img src="https://iili.io/fh2eSbn.png" alt="Logo" className="w-12 h-12 object-contain drop-shadow-xl hover:scale-110 transition-transform duration-300" />
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
          {activeTab !== 'create' && activeTab !== 'explore' && activeTab !== 'home' && (
            <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10 h-14 flex items-center justify-center px-4 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <img src="https://iili.io/fh2eSbn.png" alt="Logo" className="w-9 h-9 object-contain drop-shadow-lg" />
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
          <main className={`${activeTab === 'create' ? 'pt-0 px-0 pb-0 md:pt-10 md:pb-10 md:px-4' : (activeTab === 'explore' || activeTab === 'home' ? 'pt-4 px-2 pb-24 md:pt-10 md:px-4' : 'pt-20 pb-24 px-4 md:pt-10 md:pb-10')} md:pl-32 md:pr-8 max-w-[1800px] mx-auto min-h-screen`}>
            {renderContent()}
          </main>

          {/* Footer / Scroll to Top (Only show on Home Verse/Video Tab) */}
          {activeTab !== 'create' && activeTab === 'home' && homeSubTab !== 'bible' && (
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