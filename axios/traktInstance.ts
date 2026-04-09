import axios from 'axios';

const traktInstance = axios.create({
    baseURL: 'https://api.trakt.tv',
    headers: {
        'Content-Type': 'application-json',
        Accept: 'application-json',
    },
});

export default traktInstance;
