'use client';
import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icons';

export default function InstallApp() {
  const prompt=useRef(null), dialog=useRef(null);
  const [available,setAvailable]=useState(false),[ios,setIos]=useState(false),[installed,setInstalled]=useState(false),[dismissed,setDismissed]=useState(false);
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    setInstalled(window.matchMedia('(display-mode: standalone)').matches || !!navigator.standalone);
    setIos(/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1));
    setReady(true);
    const before=event=>{event.preventDefault();prompt.current=event;setAvailable(true);};
    const done=()=>{prompt.current=null;setInstalled(true);setAvailable(false);dialog.current?.close();};
    const open=()=>{if(!dialog.current.open)dialog.current.showModal();};
    window.addEventListener('beforeinstallprompt',before);
    window.addEventListener('appinstalled',done);
    window.addEventListener('karaoke-install-open',open);
    return ()=>{window.removeEventListener('beforeinstallprompt',before);window.removeEventListener('appinstalled',done);window.removeEventListener('karaoke-install-open',open);};
  },[]);
  async function install(){
    if(!prompt.current){dialog.current.showModal();return;}
    await prompt.current.prompt();await prompt.current.userChoice;
    prompt.current=null;setAvailable(false);dialog.current.close();
  }
  function dismiss(){setDismissed(true);}
  return <>
    {ready&&!installed&&!dismissed&&<aside className="install-offer"><img src="/assets/app-icon-192.png" alt="" width="40" height="40"/><div><strong>Karaoke Hub</strong><small>Нүүр дэлгэцээсээ хурдан нээгээрэй</small></div><button className="install-action" onClick={install}>Суулгах</button><button className="install-dismiss" aria-label="Суулгах саналыг хаах" onClick={dismiss}><Icon name="close"/></button></aside>}
    <dialog className="install-dialog" ref={dialog} aria-labelledby="installTitle"><button className="promo-close" aria-label="Хаах" onClick={()=>dialog.current.close()}><Icon name="close"/></button><img src="/assets/app-icon-192.png" alt="" width="64" height="64"/><h2 id="installTitle">Karaoke Hub суулгах</h2>{installed?<p>Апп суулгасан байна. Нүүр дэлгэцийн icon-оос нээгээрэй.</p>:available?<><p>Нүүр дэлгэцдээ нэмээд апп шиг ашиглаарай.</p><button className="install-action" onClick={install}>Суулгах</button></>:ios?<p>Браузерын <strong>Share</strong> товч → <strong>Add to Home Screen</strong> → <strong>Add</strong> сонгоорой.</p>:<p>Браузерын меньюгээс <strong>Install app</strong> эсвэл <strong>Create shortcut</strong> сонгоорой. Суулгах боломжтой үед энд «Суулгах» товч гарна.</p>}</dialog>
  </>;
}
