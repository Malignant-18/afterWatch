// src/types/traktRatings.ts

export type TraktRatingItem = TraktRatingMovie | TraktRatingShow | TraktRatingEpisode;

interface TraktRatingBase {
  rated_at: string;
  rating: number;
  type: 'movie' | 'show' | 'episode';
}

export interface TraktRatingMovie extends TraktRatingBase {
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

export interface TraktRatingShow extends TraktRatingBase {
  type: 'show';
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

export interface TraktRatingEpisode extends TraktRatingBase {
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
