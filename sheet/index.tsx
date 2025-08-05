import ExampleSheet from 'components/sheet/exampleSheet';
import { registerSheet } from 'react-native-actions-sheet';

import CommentSheet from '../components/sheet/CommentSheet';
import RatingSheet from '../components/sheet/RatingSheet';
registerSheet('rating-sheet', RatingSheet);
registerSheet('comment-sheet', CommentSheet);
registerSheet('example-sheet', ExampleSheet);
export const SheetNames = {
    ratingSheet: 'rating-sheet',
    CommentSheet: 'comment-sheet',
    exampleSheet: 'example-sheet',
};
