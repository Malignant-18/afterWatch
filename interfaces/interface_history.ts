export type TraktHistoryItem = TraktHistoryMovie | TraktHistoryEpisode;

interface TraktHistoryBase {
  id: number;
  watched_at: string;
  type: 'movie' | 'episode';
  action?: string; // Made optional
}

// Movie type
export interface TraktHistoryMovie extends TraktHistoryBase {
  type: 'movie';
  movie: {
    title: string;
    year?: number; // Made optional
    ids: {
      trakt: number;
      slug?: string; // Made optional
      imdb?: string;
      tmdb?: number;
    };
  };
}

// Episode type
export interface TraktHistoryEpisode extends TraktHistoryBase {
  type: 'episode';
  episode: {
    season: number;
    number: number;
    title: string;
    ids: {
      trakt: number;
      imdb?: string;
      tmdb?: number;
    };
  };
  show: {
    title: string;
    year?: number; // Optional
    ids: {
      trakt: number;
      slug?: string; // Optional
      imdb?: string;
      tmdb?: number;
    };
  };
}
