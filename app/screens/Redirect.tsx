import { useRoute } from '@react-navigation/native';
import EpisodeDetail from 'app/screens/details/EpisodeDetail';
import EpisodeGroup from 'app/screens/details/EpisodeGroup';
import MovieDetail from 'app/screens/details/MovieDetail';

type RouteParams = {
    type: 'movie' | 'episode' | 'episode_group';
    trakt_id: number;
};

export default function Redirect() {
    const route = useRoute();
    const { type, trakt_id } = route.params as RouteParams;

    if (type === 'episode_group') return <EpisodeGroup show_id={trakt_id} />;
    if (type === 'movie') return <MovieDetail trakt_id={trakt_id} />;
    return <EpisodeDetail trakt_id={trakt_id} />;
}
