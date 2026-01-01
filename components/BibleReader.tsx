import React, { useState, useEffect, useRef } from 'react';
import { BIBLE_BOOKS, fetchFullChapter } from '../services/bibleService';
import { ChevronLeft, ChevronRight, BookOpen, Loader2, Book } from 'lucide-react';
import { ApiVerseResponse } from '../types';

export const BibleReader: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState('Juan');
  const [chapter, setChapter] = useState(1);
  const [chapterData, setChapterData] = useState<ApiVerseResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  const loadChapter = async (b: string, c: number) => {
    setLoading(true);
    const data = await fetchFullChapter(b, c);
    setChapterData(data);
    if(contentRef.current) contentRef.current.scrollTop = 0;
    setLoading(false);
  };

  useEffect(() => {
    loadChapter(selectedBook, chapter);
  }, []); 

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

  // --- CLEAN DESKTOP READER (No 3D) ---
  const renderDesktopReader = () => (
      <div className="hidden md:flex flex-col items-center w-full max-w-5xl mx-auto pb-20">
          
          {/* Reader Header */}
          <div className="w-full bg-[#1A1A1A] rounded-t-3xl border border-white/10 p-6 flex items-center justify-between shadow-2xl">
              <div className="flex items-center gap-4">
                   <div className="p-3 bg-white/5 rounded-full border border-white/10">
                       <Book size={24} className="text-white" />
                   </div>
                   <div>
                       <h2 className="text-2xl font-bold text-white tracking-wide">{selectedBook}</h2>
                       <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Reina Valera 1960</p>
                   </div>
              </div>

              <div className="flex items-center gap-4 bg-black/20 p-2 rounded-full border border-white/5">
                   <button 
                        onClick={handlePrev} 
                        disabled={chapter <= 1} 
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white disabled:opacity-30 transition-colors"
                   >
                        <ChevronLeft size={20} />
                   </button>
                   <div className="flex flex-col items-center min-w-[100px]">
                        <span className="text-xs text-gray-400 uppercase font-bold">Capítulo</span>
                        <span className="text-xl font-serif font-bold text-white">{chapter}</span>
                   </div>
                   <button 
                        onClick={handleNext} 
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors"
                   >
                        <ChevronRight size={20} />
                   </button>
              </div>

              <div className="relative group">
                  <select 
                        value={selectedBook}
                        onChange={handleBookChange}
                        className="appearance-none bg-white text-black font-bold py-2 pl-4 pr-10 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors outline-none"
                    >
                        {BIBLE_BOOKS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-black pointer-events-none" size={16} />
              </div>
          </div>

          {/* Reader Content Body */}
          <div className="w-full bg-[#0F0F0F] rounded-b-3xl border-x border-b border-white/10 p-12 min-h-[60vh] relative">
               {loading ? (
                   <div className="absolute inset-0 flex items-center justify-center">
                       <Loader2 className="w-12 h-12 text-white/20 animate-spin" />
                   </div>
               ) : (
                   <div className="columns-1 md:columns-2 gap-12 space-y-6 text-lg leading-relaxed font-serif text-gray-300">
                       {chapterData?.verses.map((v) => (
                           <p key={v.verse} className="break-inside-avoid mb-4 hover:text-white transition-colors duration-300">
                               <span className="text-xs font-sans font-bold text-yellow-500/80 mr-2 align-top bg-yellow-500/10 px-1.5 py-0.5 rounded">{v.verse}</span>
                               {v.text}
                           </p>
                       ))}
                   </div>
               )}
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
        {renderDesktopReader()}
        {renderMobileBook()}
    </>
  );
};

// Helper icon
const ChevronDownIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);