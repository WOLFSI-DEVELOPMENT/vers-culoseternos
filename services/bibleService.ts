import { Verse, ApiVerseResponse } from '../types';
import { POPULAR_CHAPTERS, FALLBACK_VERSES } from '../constants';

const BASE_URL = 'https://bible-api.com';
const TRANSLATION = 'alera'; // Antigua Versión de Casiodoro de Reina (1569) check translation availability

// Helper to get random item
const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

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