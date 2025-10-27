export interface YouTubeVideoInfo {
  videoId: string;
  url: string;
  thumbnailUrl: string;
  embedUrl: string;
}

export function parseYouTubeUrl(url: string): YouTubeVideoInfo | null {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /youtube\.com\/live\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      const videoId = match[1];
      return {
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
      };
    }
  }

  return null;
}

export function getYouTubeThumbnail(url: string, quality: 'default' | 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault' = 'maxresdefault'): string | null {
  const videoInfo = parseYouTubeUrl(url);
  if (!videoInfo) return null;
  
  return `https://img.youtube.com/vi/${videoInfo.videoId}/${quality}.jpg`;
}

export function isYouTubeUrl(url: string): boolean {
  return parseYouTubeUrl(url) !== null;
}
