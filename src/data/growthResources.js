export const PLEDGE_PDF_URL = '/pdfs/marketplace-pledge.pdf';
export const PLEDGE_PDF_FILENAME = 'Marketplace-Pledge-Card.pdf';
export const PLEDGE_PREVIEW_URL = '/pdfs/marketplace-pledge-preview.png';

export const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/channel/UCOiRENeUnu9gVjbdLnXdnZw';

export const growthVideos = [
  {
    id: 'zVNiia5_CXQ',
    title: 'The Twin Crown Jewels',
    category: 'df-dscore',
    categoryLabel: 'DF & D-Score',
    url: 'https://www.youtube.com/watch?v=zVNiia5_CXQ',
    thumbnail: '/images/twin-crown-jewels-thumb.svg',
    thumbnailFallback: '/images/twin-crown-jewels-thumb.svg',
  },
  {
    id: '1YzaXaytMRE',
    title: 'The Marketplace Pledge',
    category: 'pledge',
    categoryLabel: 'Marketplace Pledge',
    url: 'https://www.youtube.com/watch?v=1YzaXaytMRE',
    thumbnail: 'https://i.ytimg.com/vi/1YzaXaytMRE/hqdefault.jpg',
  },
];

export const dfDScoreVideo = growthVideos.find((v) => v.category === 'df-dscore');
