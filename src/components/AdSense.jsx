// import React, { useEffect } from 'react';

// const AdSense = ({ client }) => {
//   useEffect(() => {
//     const script = document.createElement('script');
//     script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
//     script.async = true;
//     document.head.appendChild(script);

//     return () => {
//       document.head.removeChild(script);
//     };
//   }, []);

//   return (
//     <script
//       dangerouslySetInnerHTML={{
//         __html: `window.adsbygoogle = window.adsbygoogle || []).push({
//           google_ad_client: "${client}",
//           enable_page_level_ads: true
//         });`,
//       }}
//     />
//   );
// };

// export default AdSense;

import React, { useEffect } from 'react';

const AdSense = ({ client }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [client]);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client={client}
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  );
};

export default AdSense;
