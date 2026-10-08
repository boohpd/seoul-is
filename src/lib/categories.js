export const CATEGORIES = {
  kpop: { id: 'kpop', name: 'K-POP', emoji: '🎵', color: '#FF2D55', desc: 'Charts, news & trending', sources: ['Billboard', 'Spotify', 'YouTube'] },
  kdrama: { id: 'kdrama', name: 'K-DRAMA', emoji: '🎬', color: '#5856D6', desc: 'Top dramas & streaming', sources: ['Netflix', 'IMDb', 'MyDramaList'] },
  food: { id: 'food', name: 'FOOD', emoji: '🍜', color: '#FF9500', desc: 'Michelin, street food & more', sources: ['Michelin Guide', "World's 50 Best", 'Google'] },
  places: { id: 'places', name: 'HOT PLACES', emoji: '📍', color: '#30D158', desc: 'Trending cafes & hidden gems', sources: ['Instagram', 'TikTok', 'Time Out'] },
  travel: { id: 'travel', name: 'TRAVEL GUIDES', emoji: '✈️', color: '#0A84FF', desc: 'Up-to-date guides for Seoul visitors', sources: ['Seoul.is', 'Curated 2026'] },
  ranking: { id: 'ranking', name: 'RANKING', emoji: '🏆', color: '#FFD60A', desc: 'Top charts & box office', sources: ['Melon', 'Netflix TOP 10', 'CGV'] },
  lifestyle: { id: 'lifestyle', name: 'LIFESTYLE', emoji: '✨', color: '#BF5AF2', desc: 'K-Beauty, fashion & trends', sources: ['Vogue Korea', 'Seoul Fashion Week'] },
  kproperty: { id: 'kproperty', name: 'K-PROPERTY', emoji: '🏠', color: '#0A84FF', desc: 'Real estate, investment & living', sources: ['Korea Herald', 'JoongAng Daily', 'Seoul Gov'] },
};

export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh-cn', name: '简体中文', flag: '🇨🇳' },
  { code: 'zh-tw', name: '繁體中文', flag: '🇹🇼' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'th', name: 'ภาษาไทย', flag: '🇹🇭' },
];

export const CAT_ORDER = ['kpop', 'kdrama', 'food', 'places', 'travel', 'ranking', 'lifestyle', 'kproperty'];
