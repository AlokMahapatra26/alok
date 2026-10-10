export interface MediaLog {
  id: string;
  title: string;
  type: 'movie' | 'book' | 'video' | 'music' | 'other';
  creator: string;
  year?: string;
  poster: string;
  rating: number; // 1 to 5
  isRecommended: boolean;
  notes: string;
  link?: string;
  dateLogged: string;
}

// Add your media logs here or via the + Log Media button
export const initialMediaLogs: MediaLog[] = [];
