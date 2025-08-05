import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://192.168.29.130:5000',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

export default axiosInstance;
