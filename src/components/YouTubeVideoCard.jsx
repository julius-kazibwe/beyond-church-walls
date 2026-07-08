import { useEffect, useMemo, useState } from 'react';
import { extractYouTubeId, getYouTubeThumbnail, YOUTUBE_THUMB_QUALITIES } from '../utils/youtubeThumbnail';

const YouTubeVideoCard = ({ video, featured = false }) => {
  const youtubeId = useMemo(
    () => video.youtubeId || extractYouTubeId(video.url) || extractYouTubeId(video.id),
    [video.youtubeId, video.url, video.id]
  );

  const [qualityIndex, setQualityIndex] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setQualityIndex(0);
    setImgFailed(false);
  }, [youtubeId]);

  const imgSrc = youtubeId
    ? getYouTubeThumbnail(youtubeId, YOUTUBE_THUMB_QUALITIES[qualityIndex])
    : '';

  const handleImageError = () => {
    if (qualityIndex < YOUTUBE_THUMB_QUALITIES.length - 1) {
      setQualityIndex((prev) => prev + 1);
      return;
    }
    setImgFailed(true);
  };

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block rounded-xl overflow-hidden border bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
        featured ? 'border-gold/50 ring-2 ring-gold/20' : 'border-gray-100 hover:border-gold/40'
      }`}
    >
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-navy via-blue-900 to-navy">
        {youtubeId && !imgFailed ? (
          <img
            src={imgSrc}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gold" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <p className="text-gold font-bold text-lg leading-snug">{video.title}</p>
          </div>
        )}
        <div className="absolute inset-0 bg-navy/20 group-hover:bg-navy/10 transition-colors flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {video.categoryLabel && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-navy/90 text-gold">
            {video.categoryLabel}
          </span>
        )}
      </div>
      <div className="p-4 sm:p-5">
        <h3 className="font-bold text-navy leading-snug group-hover:text-blue-900 transition-colors line-clamp-2">
          {video.title}
        </h3>
        <p className="mt-2 text-sm text-gold font-semibold flex items-center gap-1.5">
          Watch on YouTube
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </p>
      </div>
    </a>
  );
};

export default YouTubeVideoCard;
