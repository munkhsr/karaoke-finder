'use client';

import { useEffect, useRef } from 'react';
import { Icon } from './Icons';

export default function PromoBanner() {
  const dialog = useRef(null);
  useEffect(() => {
    const open=event=>{
      if (dialog.current && !dialog.current.open) {
        dialog.current.showModal();
        dialog.current.focus({ preventScroll:true });
      }
    };
    window.addEventListener('karaoke-promo-open',open);
    if (window.location.pathname === '/') open();
    return () => {window.removeEventListener('karaoke-promo-open',open);dialog.current?.close();};
  }, []);
  return <dialog className="promo-banner" ref={dialog} tabIndex={-1} aria-labelledby="bannerTitle" onClick={event=>{
    if(event.target!==dialog.current) return;
    const bounds=dialog.current.getBoundingClientRect();
    if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom) dialog.current.close();
  }}>
    <button className="promo-close" type="button" aria-label="Баннер хаах" onClick={()=>dialog.current.close()}><Icon name="close"/></button>
    <div className="reference-banner promo-art"><span className="reference-frame"><img className="reference-image" src="/assets/design-reference.png" width="1312" height="1199" alt="Амттай хоол, сайхан дууны хамт"/></span></div>
    <p className="promo-label">РЕКЛАМ</p>
    <h2 id="bannerTitle">Амттай хоол, сайхан дууны хамт</h2>
    <p>Бидэнтэй холбоо барих бол <a href="tel:99551199">99551199</a> дугаарт холбогдоно уу.</p>
  </dialog>;
}
