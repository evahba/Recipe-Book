import { useState } from 'react';
import { cn } from '../lib/utils';

export function FadeImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full h-full">
      {!loaded && <div className="absolute inset-0 bg-slate-200 animate-pulse" />}
      <img
        src={src}
        alt={alt}
        className={cn(className, 'transition-opacity duration-500', loaded ? 'opacity-100' : 'opacity-0')}
        onLoad={() => setLoaded(true)}
        onError={e => {
          (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/f8fafc/cbd5e1?text=No+Image';
          setLoaded(true);
        }}
      />
    </div>
  );
}
