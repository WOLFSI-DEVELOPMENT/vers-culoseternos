import React, { useState, useEffect, useRef } from 'react';
import { BIBLE_BOOKS, fetchFullChapter } from '../services/bibleService';
import { ChevronLeft, ChevronRight, BookOpen, Loader2 } from 'lucide-react';
import { ApiVerseResponse } from '../types';

export const BibleReader: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState('Génesis');
  const [chapter, setChapter] = useState(1);
  const [chapterData, setChapterData] = useState<ApiVerseResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false); // For 3D animation state

  const contentRef = useRef<HTMLDivElement>(null);

  const loadChapter = async (b: string, c: number) => {
    setLoading(true);
    setIsFlipping(true); // Start flip
    const data = await fetchFullChapter(b, c);
    
    // Delay setting data slightly to sync with flip animation middle point
    setTimeout(() => {
        setChapterData(data);
        if(contentRef.current) contentRef.current.scrollTop = 0;
        setLoading(false);
        setTimeout(() => setIsFlipping(false), 300); // End flip
    }, 300);
  };

  useEffect(() => {
    loadChapter(selectedBook, chapter);
  }, []); // Initial load

  const handleNext = () => {
     setChapter(prev => {
         const next = prev + 1;
         loadChapter(selectedBook, next);
         return next;
     });
  };

  const handlePrev = () => {
    if(chapter > 1) {
        setChapter(prev => {
            const next = prev - 1;
            loadChapter(selectedBook, next);
            return next;
        });
    }
  };

  const handleBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedBook(e.target.value);
      setChapter(1);
      loadChapter(e.target.value, 1);
  };

  // --- 3D BOOK DESKTOP COMPONENT ---
  const renderDesktopBook = () => (
      <div className="hidden md:flex items-center justify-center w-full h-[80vh] perspective-[1500px]">
          <div className="relative w-[900px] h-[600px] bg-[#3d2b1f] rounded-r-2xl rounded-l-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex px-4 py-4 border-l-8 border-[#2a1d15]">
              
              {/* Spine Highlight */}
              <div className="absolute left-1/2 top-0 bottom-0 w-8 -ml-4 bg-gradient-to-r from-black/20 via-black/10 to-transparent z-20 pointer-events-none" />

              {/* Left Page (Static base) */}
              <div className="flex-1 bg-[#fdfbf7] rounded-l-md shadow-inner p-8 overflow-hidden relative border-r border-gray-300">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-50 pointer-events-none" />
                  <div className="h-full overflow-y-auto custom-scrollbar pr-4 text-gray-800 font-serif leading-relaxed text-lg">
                      <div className="sticky top-0 bg-[#fdfbf7]/90 backdrop-blur-sm pb-4 mb-4 border-b border-gray-200 z-10 flex justify-between items-center">
                           <div>
                               <span className="block text-xs font-sans font-bold text-gray-400 uppercase tracking-widest">Reina Valera 1960 (Ref)</span>
                               <h2 className="text-3xl font-bold text-gray-900">{selectedBook} {chapter}</h2>
                           </div>
                           <div className="flex gap-2">
                               <select 
                                   value={selectedBook}
                                   onChange={handleBookChange}
                                   className="bg-transparent text-sm font-bold border-none outline-none text-gray-600 hover:text-black cursor-pointer"
                               >
                                   {BIBLE_BOOKS.map(b => <option key={b} value={b}>{b}</option>)}
                               </select>
                           </div>
                      </div>
                      
                      {/* Left Column Content - We split verses roughly or show half/half */}
                      {loading ? (
                          <div className="space-y-4">
                              {[1,2,3,4].map(i => <div key={i} className="h-4 bg-gray-200 rounded animate-pulse w-full"/>)}
                          </div>
                      ) : (
                          <div className="space-y-4">
                              {chapterData?.verses.filter((_, i) => i < (chapterData?.verses.length || 0) / 2).map((v) => (
                                  <p key={v.verse} className="text-justify">
                                      <sup className="text-xs font-sans font-bold text-red-800 mr-1">{v.verse}</sup>
                                      {v.text}
                                  </p>
                              ))}
                          </div>
                      )}
                  </div>
              </div>

              {/* Right Page (Animated) */}
              <div className="flex-1 relative perspective-[2000px]">
                  <div 
                    className={`w-full h-full bg-[#fdfbf7] rounded-r-md shadow-inner p-8 origin-left transition-transform duration-700 ease-in-out transform-style-3d ${isFlipping ? '-rotate-y-12 bg-gray-100' : 'rotate-y-0'}`}
                    style={{ transformOrigin: 'left center' }}
                  >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-50 pointer-events-none" />
                        
                        <div className="h-full overflow-y-auto custom-scrollbar pl-4 text-gray-800 font-serif leading-relaxed text-lg">
                            <div className="sticky top-0 bg-[#fdfbf7]/90 backdrop-blur-sm pb-4 mb-4 border-b border-gray-200 z-10 flex justify-end gap-2">
                                <button onClick={handlePrev} disabled={chapter <= 1} className="p-2 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-30">
                                    <ChevronLeft size={20} color="#333" />
                                </button>
                                <span className="flex items-center font-bold text-gray-500">Cap. {chapter}</span>
                                <button onClick={handleNext} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <ChevronRight size={20} color="#333" />
                                </button>
                            </div>

                            {loading ? (
                                <div className="space-y-4 mt-10">
                                     {[1,2,3,4].map(i => <div key={i} className="h-4 bg-gray-200 rounded animate-pulse w-full"/>)}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {chapterData?.verses.filter((_, i) => i >= (chapterData?.verses.length || 0) / 2).map((v) => (
                                        <p key={v.verse} className="text-justify">
                                            <sup className="text-xs font-sans font-bold text-red-800 mr-1">{v.verse}</sup>
                                            {v.text}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                  </div>
              </div>
          </div>
      </div>
  );

  // --- MOBILE COMPONENT ---
  const renderMobileBook = () => (
      <div className="md:hidden flex flex-col w-full min-h-screen pb-24 bg-[#111]">
          {/* Controls */}
          <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-md border-b border-white/10 p-4 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                      <BookOpen size={18} className="text-white" />
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Biblia RVR1960</span>
                  </div>
                  <div className="flex gap-2">
                      <button onClick={handlePrev} disabled={chapter <= 1} className="p-2 bg-white/10 rounded-full disabled:opacity-30">
                          <ChevronLeft size={16} className="text-white" />
                      </button>
                      <button onClick={handleNext} className="p-2 bg-white/10 rounded-full">
                          <ChevronRight size={16} className="text-white" />
                      </button>
                  </div>
              </div>
              
              <div className="flex gap-2">
                  <select 
                      value={selectedBook}
                      onChange={handleBookChange}
                      className="flex-1 bg-white/5 border border-white/10 text-white rounded-lg p-3 text-sm font-bold outline-none"
                  >
                      {BIBLE_BOOKS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <div className="bg-white/5 border border-white/10 rounded-lg px-4 flex items-center justify-center text-white font-bold">
                      {chapter}
                  </div>
              </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
              {loading ? (
                  <div className="flex justify-center py-20">
                      <Loader2 className="animate-spin text-white" />
                  </div>
              ) : (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <h1 className="text-3xl font-serif font-bold text-white mb-6 text-center">{selectedBook} {chapter}</h1>
                      {chapterData?.verses.map((v) => (
                          <div key={v.verse} className="flex gap-3">
                              <span className="text-xs font-bold text-gray-500 mt-1.5 min-w-[1.5rem]">{v.verse}</span>
                              <p className="text-gray-200 font-serif text-lg leading-relaxed">
                                  {v.text}
                              </p>
                          </div>
                      ))}
                      
                      <div className="pt-8 flex justify-center">
                           <button onClick={handleNext} className="px-8 py-3 bg-white text-black rounded-full font-bold flex items-center gap-2">
                               Siguiente Capítulo <ChevronRight size={16} />
                           </button>
                      </div>
                  </div>
              )}
          </div>
      </div>
  );

  return (
    <>
        {renderDesktopBook()}
        {renderMobileBook()}
    </>
  );
};