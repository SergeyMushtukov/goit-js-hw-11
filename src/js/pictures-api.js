import axios from 'axios';

const URL = 'https://pixabay.com/api';
const API_KEY = '37443859-819820d616605921c7289dca4';

export async function fetchPictures({ whatToSearch, pageNumber, perPage }) {
  const searchParams = new URLSearchParams({
    key: API_KEY,
    q: whatToSearch,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: perPage,
    page: pageNumber,
  });

  const response = await axios.get(`${URL}?${searchParams}`);

  return response.data;
}
