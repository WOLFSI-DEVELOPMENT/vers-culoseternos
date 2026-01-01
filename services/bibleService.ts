import { Verse, ApiVerseResponse } from '../types';
import { POPULAR_CHAPTERS, FALLBACK_VERSES } from '../constants';

const BASE_URL = 'https://bible-api.com';
const TRANSLATION = 'alera'; // Antigua Versión de Casiodoro de Reina (Open source alternative to RVR1960)

// Helper to get random item
const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const BIBLE_BOOKS = [
  "Génesis", "Éxodo", "Levítico", "Números", "Deuteronomio", "Josué", "Jueces", "Rut", "1 Samuel", "2 Samuel", 
  "1 Reyes", "2 Reyes", "1 Crónicas", "2 Crónicas", "Esdras", "Nehemías", "Ester", "Job", "Salmos", "Proverbios", 
  "Eclesiastés", "Cantares", "Isaías", "Jeremías", "Lamentaciones", "Ezequiel", "Daniel", "Oseas", "Joel", "Amós", 
  "Abdías", "Jonás", "Miqueas", "Nahúm", "Habacuc", "Sofonías", "Hageo", "Zacarías", "Malaquías", "Mateo", "Marcos", 
  "Lucas", "Juan", "Hechos", "Romanos", "1 Corintios", "2 Corintios", "Gálatas", "Efesios", "Filipenses", "Colosenses", 
  "1 Tesalonicenses", "2 Tesalonicenses", "1 Timoteo", "2 Timoteo", "Tito", "Filemón", "Hebreos", "Santiago", 
  "1 Pedro", "2 Pedro", "1 Juan", "2 Juan", "3 Juan", "Judas", "Apocalipsis"
];

export const fetchRandomChapterVerses = async (): Promise<Verse[]> => {
  try {
    const chapter = getRandomItem(POPULAR_CHAPTERS);
    // Fetching a whole chapter is more efficient for infinite scroll than fetching single verses
    const response = await fetch(`${BASE_URL}/${chapter}?translation=${TRANSLATION}`);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data: ApiVerseResponse = await response.json();
    
    // Transform API response into our Verse format
    return data.verses.map((v) => ({
      id: `${v.book_name}-${v.chapter}-${v.verse}-${Math.random().toString(36).substr(2, 9)}`, // Unique ID
      reference: `${v.book_name} ${v.chapter}:${v.verse}`,
      text: v.text.replace(/\n/g, ' ').trim(),
      translation_id: data.translation_id,
      book_name: v.book_name,
      chapter: v.chapter,
      verse: v.verse,
    }));
  } catch (error) {
    console.warn("API request failed, using fallback", error);
    // Return fallback verses with new IDs to simulate fresh content
    return FALLBACK_VERSES.map(v => ({
      ...v,
      id: `fallback-${Math.random().toString(36).substr(2, 9)}`,
      translation_id: 'alera'
    }));
  }
};

export const fetchFullChapter = async (book: string, chapter: number): Promise<ApiVerseResponse | null> => {
    try {
        const response = await fetch(`${BASE_URL}/${book}+${chapter}?translation=${TRANSLATION}`);
        if (!response.ok) throw new Error('Failed to fetch chapter');
        return await response.json();
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const getVerseOfTheDay = (): Verse => {
  // Generate a deterministic index based on the date string
  const today = new Date().toDateString();
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = today.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % FALLBACK_VERSES.length;
  
  const v = FALLBACK_VERSES[index];
  return {
      id: 'daily-verse',
      reference: v.reference,
      text: v.text,
      book_name: v.book_name,
      chapter: v.chapter,
      verse: v.verse,
      translation_id: 'alera'
  };
};