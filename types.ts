export interface Verse {
  id: string;
  reference: string;
  text: string;
  translation_id: string;
  book_name: string;
  chapter: number;
  verse: number;
}

export interface ApiVerseResponse {
  reference: string;
  verses: {
    book_name: string;
    chapter: number;
    verse: number;
    text: string;
  }[];
  text: string;
  translation_id: string;
}

export interface VerseCardData extends Verse {
  imageUrl: string;
  heightClass: string; // Tailwind class for height or aspect ratio simulation
}

export interface SavedDesign {
  id: string;
  text: string;
  reference: string;
  fontIndex: number;
  bgType: 'gradient' | 'image';
  gradient: string;
  bgImage: string | null;
  timestamp: number;
}

export interface User {
  name: string;
  email: string;
  picture: string;
  username: string;
  bio?: string;
}

export interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      high: {
        url: string;
      };
      medium: {
        url: string;
      };
    };
    channelTitle: string;
  };
}