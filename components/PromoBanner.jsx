'use client';

import { useEffect, useRef } from 'react';
import { Icon } from './Icons';
import { trackEvent } from '../lib/analytics.mjs';

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
    <div className="promo-slot" aria-hidden="true">
      <span className="promo-slot-badge">ЗАР</span>
      <strong>Танай бүтээгдэхүүн<br/>энд</strong>
      <small>Баннер байршуулах орон зай</small>
    </div>
    <p className="promo-label">СУРТАЛЧИЛГААНЫ ОРОН ЗАЙ</p>
    <h2 id="bannerTitle">Танай бүтээгдэхүүний орон зай</h2>
    <p>Караоке дуулахаар код хайж буй хэрэглэгчдэд брэнд, бүтээгдэхүүнээ хүргээрэй.</p>
    <a className="promo-contact" href="tel:99551199" onClick={()=>trackEvent('banner_click',{banner_id:'house-advertise',banner_placement:'popup',banner_kind:'house'})}><Icon name="phone"/> Холбоо барих · 9955 1199</a>
  </dialog>;
}
