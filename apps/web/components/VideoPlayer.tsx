'use client';

interface VideoPlayerProps {
  url: string;
  title?: string;
}

export default function VideoPlayer({ url, title }: VideoPlayerProps) {
  // YouTube
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/
  );

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);

  if (youtubeMatch) {
    return (
      <div className="aspect-video w-full mb-6 rounded-lg overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
          title={title || 'YouTube video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  if (vimeoMatch) {
    return (
      <div className="aspect-video w-full mb-6 rounded-lg overflow-hidden">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
          title={title || 'Vimeo video'}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  // Direct video file
  if (url.match(/\.(mp4|webm|ogg)$/i)) {
    return (
      <div className="mb-6 rounded-lg overflow-hidden bg-black">
        <video controls className="w-full" title={title}>
          <source src={url} />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // Unsupported or no video
  return (
    <div className="mb-6 p-4 bg-gray-50 border rounded-lg text-center text-gray-500">
      <p>Video URL: <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{url}</a></p>
    </div>
  );
}