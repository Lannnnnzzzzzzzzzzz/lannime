import axios from 'axios';

const BASE_URL = 'https://www.sankavollerei.com/anime/samehadaku';

export async function getSamehadakuAnime(slug) {
  try {
    const { data } = await axios.get(`${BASE_URL}/anime/${slug}`);
    return data;
  } catch (error) {
    console.error('Error fetching Samehadaku anime:', error);
    throw error;
  }
}

export async function getSamehadakuEpisode(episodeSlug) {
  try {
    const { data } = await axios.get(`${BASE_URL}/episode/${episodeSlug}`);
    return data;
  } catch (error) {
    console.error('Error fetching Samehadaku episode:', error);
    throw error;
  }
}

export async function searchSamehadaku(query) {
  try {
    const { data } = await axios.get(`${BASE_URL}/search`, {
      params: { q: query }
    });
    return data;
  } catch (error) {
    console.error('Error searching Samehadaku:', error);
    throw error;
  }
}
