// Popular chapters to fetch from the API to get batches of verses
export const POPULAR_CHAPTERS = [
  "Juan 3", "Salmos 23", "Romanos 8", "1 Corintios 13", "Filipenses 4",
  "Proverbios 3", "Génesis 1", "Mateo 5", "Mateo 6", "Mateo 7",
  "Salmos 91", "Isaías 40", "Isaías 53", "Efesios 2", "Gálatas 5",
  "Santiago 1", "1 Juan 4", "Salmos 1", "Salmos 119", "Lucas 15",
  "Hebreos 11", "2 Timoteo 1", "Josué 1", "Jeremías 29", "Salmos 103"
];

// Fallback verses in case API fails or for initial load speed
export const FALLBACK_VERSES = [
  {
    reference: "Juan 3:16",
    text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
    book_name: "Juan",
    chapter: 3,
    verse: 16
  },
  {
    reference: "Filipenses 4:13",
    text: "Todo lo puedo en Cristo que me fortalece.",
    book_name: "Filipenses",
    chapter: 4,
    verse: 13
  },
  {
    reference: "Salmos 23:1",
    text: "Jehová es mi pastor; nada me faltará.",
    book_name: "Salmos",
    chapter: 23,
    verse: 1
  }
];

// Different aspect ratios/heights for masonry grid variety
export const CARD_HEIGHTS = [
  'h-64',
  'h-80',
  'h-96',
  'h-[28rem]',
  'h-[32rem]'
];