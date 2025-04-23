export type TraktHistoryItem = TraktHistoryMovie | TraktHistoryEpisode;

interface TraktHistoryBase {
  id: number; // trakt history item id
  watched_at: string; // ISO timestamp
  action: string; // 'watch', 'scrobble', etc.
  type: 'movie' | 'episode'; // used to discriminate the union
}

// Movie type
export interface TraktHistoryMovie extends TraktHistoryBase {
  type: 'movie';
  movie: {
    title: string;
    year: number;
    ids: {
      trakt: number;
      slug: string;
      imdb: string;
      tmdb: number;
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
      tvdb: number;
      imdb: string;
      tmdb: number;
      tvrage: number | null;
    };
  };
  show: {
    title: string;
    year: number;
    ids: {
      trakt: number;
      slug: string;
      tvdb: number;
      imdb: string;
      tmdb: number;
      tvrage: number | null;
    };
  };
}
