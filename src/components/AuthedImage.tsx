import React, { useEffect, useState } from 'react';

/**
 * Renders a screenshot/attachment by fetching it through the same
 * credentialed request path as the rest of the app, then displaying it
 * as a blob URL - rather than a plain <img src>.
 *
 * A plain <img src="https://backend/..."> can't carry the
 * 'ngrok-skip-browser-warning' header the way api.ts's fetch calls do,
 * and cross-site image requests are subject to the same cookie/CORS
 * quirks that browsers apply inconsistently across devices. Fetching it
 * ourselves - identical to any other API call - sidesteps both issues.
 */
export default function AuthedImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    setFailed(false);
    setBlobUrl(null);

    fetch(src, {
      credentials: 'include',
      headers: { 'ngrok-skip-browser-warning': 'true' },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load image (${res.status})`);
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (failed) {
    return (
      <div className={`${className} flex items-center justify-center bg-[#1a1b26] text-[#8e90a0] text-[10px] font-mono`}>
        Failed to load
      </div>
    );
  }

  if (!blobUrl) {
    return <div className={`${className} bg-[#1a1b26] animate-pulse`} />;
  }

  return <img src={blobUrl} alt={alt} className={className} />;
}
