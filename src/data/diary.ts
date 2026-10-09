export interface DiaryEntry {
  id: string;
  slug: string;
  title: string;
  date: string;
  isoDate: string;
  timeOfDay: string;
  location: string;
  weather: string;
  mood: string;
  moodEmoji: string;
  readTime: string;
  content: string[];
  isCustom?: boolean;
}

// Add your diary entries here or log them via the website writer
export const diaryEntries: DiaryEntry[] = [];
