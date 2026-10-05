'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import catalogue from '../lib/catalogue.json';
import selections from '../lib/selections.json';
import { buildIndex, codes, search, selectGroup, songKey } from '../lib/search.mjs';
import { Icon, Microphone, Sparkles } from './Icons';
import { artistImage } from '../lib/artists.mjs';
import { favoriteKey, restoreFavorites } from '../lib/favorites.mjs';

const index = buildIndex(catalogue);
const groups = { hit: selectGroup(catalogue,selections.hit), new: selectGroup(catalogue,selections.new) };

function Artwork({ song, detailed=false }) {
  const artist = artistImage(song.artist);
  const [failed,setFailed] = useState(false);
  useEffect(()=>setFailed(false),[artist?.src]);
  return <span className={`${detailed?'detail-art':'artist-avatar'}${artist&&!failed?' real-artist-photo':''}`} aria-hidden="true">{artist&&!failed?<img className="artist-image" src={artist.src} alt="" loading={detailed?'eager':'lazy'} onError={()=>setFailed(true)}/>: '♫'}</span>;
}
function PhotoCredit({ song }) {
  const artist = artistImage(song.artist);
  if (!artist || artist.providedByUser) return null;
  return <p className="photo-credit">Зураг: <a href={artist.source} target="_blank" rel="noreferrer">{artist.author}</a> · {artist.licenseUrl?<a href={artist.licenseUrl} target="_blank" rel="noreferrer">{artist.license}</a>:artist.license}</p>;
}
function Banner({ detailed=false }) {
  return <aside className={`ad-banner reference-banner${detailed?' detail-banner':''}`} aria-label="Реклам"><span className="reference-frame"><img className="reference-image" src="/assets/design-reference.png" alt={detailed?'Good friends, great beer':'Амттай хоол, сайхан дууны хамт'} width="1312" height="1199"/></span><button className="banner-details-button" type="button" onClick={()=>window.dispatchEvent(new CustomEvent('karaoke-promo-open',{detail:{detailed}}))}>Дэлгэрэнгүй <Icon name="arrow-right"/></button></aside>;
}
function Codes({ song, copy, detailed=false }) {
  return <div className="code-grid">{['code1','code2'].map((field,i)=><div className={`code-box${i?' ky':''}`} key={field}><span className="code-label">Код {i+1}</span>{codes(song,field).length?codes(song,field).map(code=><button className="copy-button" type="button" key={code} aria-label={`Код ${i+1} ${code} хуулах`} onClick={()=>copy(String(code))}><span className="code-value">{code}</span><span className="copy-mark" aria-hidden="true"><Icon name="copy"/>{detailed&&<span>Хуулах</span>}</span></button>):<span className="missing-code">Байхгүй</span>}</div>)}</div>;
}
function SongCard({ song, rank, saved, toggle, open, copy }) {
  return <article className="song-card">{rank&&<span className="home-rank">{rank}</span>}<div className="song-heading"><Artwork song={song}/><div className="song-info"><h3><button className="song-title" onClick={()=>open(song)} aria-label={`${song.title}, ${song.artist} — дэлгэрэнгүй харах`}>{song.title}</button></h3><p className="song-artist">Дуучин: {song.artist}</p></div></div><Codes song={song} copy={copy}/><button className="favorite-button" aria-pressed={saved} aria-label={saved?'Дуртай дуунаас хасах':'Дуртай дуунд хадгалах'} onClick={()=>toggle(song)}><Icon name="heart"/></button></article>;
}

export default function KaraokeApp({ group=null }) {
  const [query,setQuery]=useState('');
  const [limit,setLimit]=useState(40);
  const [favorites,setFavorites]=useState([]);
  const [selected,setSelected]=useState(null);
  const [toast,setToast]=useState('');
  const [toastId,setToastId]=useState(0);
  const dialog=useRef(null), menu=useRef(null), input=useRef(null), toastTimer=useRef(null);
  const home=!group&&!query.trim();
  const results=useMemo(()=>{
    const source=group==='favorites'?catalogue.filter(song=>favorites.includes(favoriteKey(song))):group?groups[group]:home?groups.hit:catalogue;
    return search(source,index,query);
  },[group,home,query,favorites]);
  const visible=home?4:limit;

  useEffect(()=>{
    try { const saved=JSON.parse(localStorage.getItem('karaoke-favorites')||'[]'); setFavorites(restoreFavorites(saved,catalogue)); } catch {}
    const close=e=>{ if(menu.current&&!menu.current.contains(e.target))menu.current.open=false; };
    const escape=e=>{ if(e.key==='Escape'&&menu.current?.open){menu.current.open=false;menu.current.querySelector('summary').focus();} };
    document.addEventListener('click',close);document.addEventListener('keydown',escape);
    return ()=>{document.removeEventListener('click',close);document.removeEventListener('keydown',escape);clearTimeout(toastTimer.current);};
  },[]);
  function openDetail(song) {
    setSelected(song);
    if (dialog.current && !dialog.current.open) dialog.current.showModal();
  }
  function closeDetail() {
    setSelected(null);
    if (dialog.current?.open) dialog.current.close();
  }
  function toggle(song){
    const key=favoriteKey(song);
    const saved=favorites.includes(key);
    const next=saved?favorites.filter(value=>value!==key):[...favorites,key];
    setFavorites(next);
    try{localStorage.setItem('karaoke-favorites',JSON.stringify(next));}catch{}
    notify(saved?'Хадгалсан дуунаас хаслаа':'Дуртай дуунд хадгаллаа');
  }
  function notify(message){setToast(message);setToastId(id=>id+1);clearTimeout(toastTimer.current);toastTimer.current=setTimeout(()=>setToast(''),2600);}
  async function copy(code){
    try{
      if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(code);
      else{const focus=document.activeElement;const textarea=document.createElement('textarea');textarea.value=code;textarea.style.cssText='position:fixed;left:-9999px;top:0';(dialog.current.open?dialog.current:document.body).append(textarea);textarea.select();let ok;try{ok=document.execCommand('copy');}finally{textarea.remove();focus?.focus();}if(!ok)throw new Error('Clipboard unavailable');}
      notify(`${code} · Хуулагдсан`);
    }catch{notify('Хуулж чадсангүй. Кодоо гараар оруулна уу.');}
  }
  function changeQuery(value){setQuery(value);setLimit(40);}
  function clear(){changeQuery('');input.current.focus();}

  return <div className={`karaoke-app${home?' home-view':' is-searching'}`} data-song-group={group||''}>
    <header className="site-header">
      {!home&&<Link className="header-back" href="/" onClick={()=>{changeQuery('' );}} aria-label="Нүүр хуудас"><Icon name="back"/></Link>}
      <Link className="nav-brand" href="/" onClick={()=>{changeQuery('' );}}><span className="brand-icon"><Microphone/></span><span><strong><span className="brand-gradient">KARAOKE</span> HUB</strong><small className="brand-tagline"><span>Дуугаа хай</span><Icon name="arrow-right"/><span>Кодоо ол</span><Icon name="arrow-right"/><span>Дуул</span></small></span></Link>
      <details className="site-menu" ref={menu}>
        <summary aria-label="Үндсэн цэс"><Icon name="menu"/></summary>
        <nav className="menu-panel" aria-label="Үндсэн цэс">
          {[
            { href:'/', label:'Нүүр хуудас', icon:<Icon name="home"/>, active:!group, tone:'home' },
            { href:'/hit-songs', label:'Хит дуунууд', icon:<Icon name="fire"/>, active:group==='hit', tone:'hit' },
            { href:'/new-songs', label:'Шинэ дуунууд', icon:<Sparkles/>, active:group==='new', tone:'new' },
            { href:'/favorites', label:'Дуртай дуунууд', icon:<Icon name="heart"/>, active:group==='favorites', tone:'new' },
          ].map(item=><Link key={item.href} href={item.href} aria-current={item.active?'page':undefined} onClick={()=>{menu.current.open=false;if(item.href==='/'){changeQuery('');}}}>
            <span className={`menu-icon menu-icon-${item.tone}`} aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span><Icon name="arrow" className="menu-arrow"/>
          </Link>)}
        <button type="button" className="menu-install" onClick={()=>{menu.current.open=false;window.dispatchEvent(new Event('karaoke-install-open'));}}><span className="menu-icon menu-icon-new" aria-hidden="true">↓</span><span>Апп суулгах</span><Icon name="arrow" className="menu-arrow"/></button></nav>
      </details>
    </header>
    <main className="container">
      {home&&<section className="hero" aria-labelledby="pageTitle"><div className="hero-copy"><h1 id="pageTitle">Дуртай дуугаа<br/>хурдан олоорой <span className="title-mic" aria-hidden="true">🎤</span></h1></div></section>}
      <div className="search-area"><div className="search-box"><Icon name="search" className="search-icon"/><input ref={input} type="search" value={query} onChange={e=>changeQuery(e.target.value)} placeholder={group==='favorites'?'Хадгалсан дуу хайх…':group==='hit'?'Хит дуу хайх…':group==='new'?'Шинэ дуу хайх…':'Дуу, дуучин эсвэл код хайх…'} aria-label="Дуу, дуучин эсвэл код хайх" aria-describedby="searchHint" autoComplete="off" enterKeyHint="search" spellCheck={false}/>{query&&<button type="button" onClick={clear} aria-label="Хайлтыг цэвэрлэх"><Icon name="close"/></button>}</div><p id="searchHint" className="search-hint">Кирилл болон латин үсгээр хайж болно.</p></div>
      {home&&<><nav className="quick-links" aria-label="Дууны сонголт"><Link href="/hit-songs"><span className="hit-icon" aria-hidden="true">🔥</span> Хит дуунууд</Link><Link href="/new-songs"><span className="new-icon"><Sparkles/></span> Шинэ дуунууд</Link></nav><p className="catalogue-description">Монгол караоке дууны кодыг нэр, дуучин эсвэл кодоор хайж олоорой.</p><Banner/></>}
      <section className="results-section" aria-labelledby="resultsTitle"><div className="results-header"><h2 id="resultsTitle">{group==='favorites'?'Дуртай дуунууд':query.trim()?'Хайлтын үр дүн':group==='new'?'Шинэ дуунууд':home?<><Icon name="crown" className="popular-icon"/>Эрэлттэй дуунууд</>:'Хит дуунууд'}</h2>{home?<Link className="see-all" href="/hit-songs"><span>Бүгдийг харах</span><Icon name="arrow"/></Link>:<span role="status" aria-live="polite">{results.length.toLocaleString('mn')} дуу</span>}</div>
        <div className="song-results">{results.slice(0,visible).map((song,i)=><SongCard key={songKey(song)} song={song} rank={home?i+1:null} saved={favorites.includes(favoriteKey(song))} toggle={toggle} open={openDetail} copy={copy}/>)}{!results.length&&<div className="empty-state"><strong>{group==='favorites'&&!favorites.length?'Хадгалсан дуу алга':'Илэрц олдсонгүй'}</strong>{group==='favorites'&&!favorites.length?'Дууны зүрхэн дээр дараад энд хадгалаарай.':'Дууны нэр, дуучин эсвэл кодоо өөрөөр бичиж үзээрэй.'}</div>}</div>
        {!home&&results.length>limit&&<button className="load-more" onClick={()=>setLimit(n=>n+40)}>Илүү олон дуу харах ({Math.min(40,results.length-limit)}) ↓</button>}
      </section>
    </main>
    <footer className="site-footer"><div className="footer-main"><Link href="/" className="footer-brand"><span className="footer-logo"><Microphone/></span><span><strong>KARAOKE HUB</strong><small>Дуугаа хай → Кодоо ол → Дуул</small></span></Link><a className="footer-contact" href="tel:99551199"><Icon name="phone"/><span><small>Холбоо барих</small><strong>9955 1199</strong></span><Icon name="arrow"/></a></div><nav className="footer-links" aria-label="Доод хэсгийн холбоос"><Link href="/hit-songs">Хит дуунууд</Link><Link href="/new-songs">Шинэ дуунууд</Link><Link href="/favorites">Дуртай дуунууд</Link></nav><div className="footer-bottom"><span>© {new Date().getFullYear()} Karaoke Hub</span><Link href="/image-credits">Зургийн эх сурвалж</Link></div></footer>
    <dialog ref={dialog} aria-labelledby="detailTitle" onClose={()=>{if(!dialog.current?.open)setSelected(null);}} onCancel={event=>{event.preventDefault();closeDetail();}} onClick={e=>{if(e.target===dialog.current){const b=dialog.current.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)closeDetail();}}}><button className="detail-close" onClick={closeDetail} aria-label="Дэлгэрэнгүйг хаах"><Icon name="arrow-left"/> Буцах</button>{selected&&<><div className="detail-summary"><Artwork song={selected} detailed/><div className="detail-heading"><h2 id="detailTitle">{selected.title}</h2><p className="detail-artist">{selected.artist}</p></div></div><Codes song={selected} copy={copy} detailed/><PhotoCredit song={selected}/>{selected.language&&<dl className="detail-meta"><div><dt>Хэл</dt><dd>{selected.language}</dd></div></dl>}<Banner detailed/></>}<div key={`detail-${toastId}`} className="detail-toast copy-notice" role="status" aria-live="polite" hidden={!toast}><Icon name={toast.includes('Хадгалсан')||toast.includes('хадгаллаа')?'heart':toast.includes('Хуулагдсан')?'check':'close'}/><span>{toast}</span></div></dialog>
    <div key={`page-${toastId}`} className="toast copy-notice" role="status" aria-live="polite" hidden={!toast||!!selected}><Icon name={toast.includes('Хадгалсан')||toast.includes('хадгаллаа')?'heart':toast.includes('Хуулагдсан')?'check':'close'}/><span>{toast}</span></div>
    <Script src="/_vercel/insights/script.js" strategy="afterInteractive"/>
  </div>;
}
