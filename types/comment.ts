// src/types/comment.ts

// Define the specific properties for each media type
export type CommentEpisodeProps = {
    filter: string;
    show_slug: string;
    show_trakt_id: number;
    season: number;
    episode: number;
    comment_count: number | null;
};

export type CommentMovieProps = {
    filter: string;
    movie_slug: string;
    trakt_id: number;
    comment_count: number | null;
};

export type CommentShowProps = {
    filter: string;
    show_slug: string;
    comment_count: number | null;
};

// Create a union type for all possible comment properties
export type CommentProps = CommentEpisodeProps | CommentMovieProps | CommentShowProps;

// Update the props for the main CommentSheet component
export type CommentSheetProps = {
    sheetId: string;
    payload: {
        type: 'episode' | 'movie' | 'show';
        commentProps: CommentProps;
    };
};
