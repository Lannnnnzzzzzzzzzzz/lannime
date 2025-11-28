const CACHE_KEY = 'anime_translations';
const CACHE_EXPIRY = 30 * 24 * 60 * 60 * 1000;

function getCachedTranslation(animeId, fieldName) {
  try {
    const cache = localStorage.getItem(CACHE_KEY);
    if (!cache) return null;

    const translations = JSON.parse(cache);
    const key = `${animeId}_${fieldName}`;
    const cached = translations[key];

    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      return cached.text;
    }
    return null;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

function setCachedTranslation(animeId, fieldName, translatedText) {
  try {
    const cache = localStorage.getItem(CACHE_KEY);
    const translations = cache ? JSON.parse(cache) : {};
    const key = `${animeId}_${fieldName}`;

    translations[key] = {
      text: translatedText,
      timestamp: Date.now(),
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(translations));
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

export async function translateText(animeId, text, fieldName = 'description') {
  const cached = getCachedTranslation(animeId, fieldName);
  if (cached) {
    return cached;
  }

  try {
    const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(translateUrl);

    if (!response.ok) {
      throw new Error('Translation failed');
    }

    const data = await response.json();

    let translatedText = '';
    if (data && data[0]) {
      translatedText = data[0].map(item => item[0]).join('');
    }

    if (!translatedText) {
      throw new Error('Empty translation result');
    }

    setCachedTranslation(animeId, fieldName, translatedText);
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return null;
  }
}
