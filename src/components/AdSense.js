import React, { useEffect, useRef } from 'react';
import Script from 'next/script';

const AdSense = ({ slot, style }) => {
  const adRef = useRef(null);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.adsbygoogle &&
      adRef.current &&
      adRef.current.offsetWidth > 0
    ) {
      try {
        window.adsbygoogle.push({});
      } catch (e) {
        // 중복 push 방지
      }
    }
  }, []);

  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
        strategy="lazyOnload"
        crossOrigin="anonymous"
      />
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', minWidth: 320, minHeight: 100 }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
      />
    </>
  );
};

export default AdSense; 