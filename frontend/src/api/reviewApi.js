import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

/**
 * Fetch approved reviews (public — no auth required).
 */
export const getPublicReviews = async () => {
  const response = await axios.get(`${BASE_URL}/reviews/public`);
  return response.data;
};
