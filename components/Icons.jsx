export function Icon({ name, ...props }) {
  const paths = {
    search: <><circle cx="10.5" cy="10.5" r="7.5"/><path d="m16 16 5 5"/></>,
    menu: <path d="M3 5h18M3 12h18M3 19h18"/>,
    crown: <><path d="m3 7 4 4 5-7 5 7 4-4-3 12H6L3 7Z" fill="currentColor" fillOpacity=".2"/><path d="M6 22h12"/></>,
    fire: <><path d="M12.5 2.5c.8 4.2-3.5 5.9-3.5 9.1-1.3-.8-1.9-2-1.8-3.6C5.2 10.1 4 12.5 4 15a8 8 0 0 0 16 0c0-3.4-1.8-6.3-4.4-8.5.3 2.3-.5 3.9-1.8 4.8.6-3.2.1-6.2-1.3-8.8Z" fill="currentColor" fillOpacity=".12"/><path d="M12 13c.4 2-2.5 3.1-2.5 5a2.5 2.5 0 0 0 5 0c0-1.5-1.3-3.5-2.5-5Z" fill="currentColor" stroke="none"/></>,
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v12h5v-7h4v7h5V9"/></>,
    arrow: <path d="m9 5 7 7-7 7"/>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    phone: <path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 2a14 14 0 0 1-7-7l2-2-2-5Z"/>,
    back: <path d="m15 5-7 7 7 7"/>,
    'arrow-left': <path d="M20 12H4m6-6-6 6 6 6"/>,
    'arrow-right': <path d="M4 12h16m-6-6 6 6-6 6"/>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>,
    copy: <><rect x="8" y="7" width="11" height="14" rx="2"/><path d="M15 7V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" focusable="false" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
export function Microphone() {
  return <svg viewBox="0 0 48 48" fill="none" focusable="false" aria-hidden="true">
    <circle cx="24" cy="24" r="21" fill="#171326" stroke="#ae69ff" strokeWidth="1.5"/>
    <path d="M5 22a19 19 0 0 1 29-14" stroke="#e65aff" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M43 26a19 19 0 0 1-29 14" stroke="#50caff" strokeWidth="2.5" strokeLinecap="round"/>
    <rect x="19" y="10" width="10" height="19" rx="5" fill="#b877fa"/>
    <path d="M21 15h6m-6 4h6" stroke="#20132f" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M15 23a9 9 0 0 0 18 0M24 32v6m-5 0h10" stroke="#faf5ff" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 19v8m3-6v4m25-6v8m-3-6v4" stroke="#55c9ff" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>;
}
export function Sparkles() {
  return <svg className="sparkles-icon" viewBox="0 0 28 28" fill="currentColor" aria-hidden="true"><path d="M17 3c1.1 6 3 7.9 9 9-6 1.1-7.9 3-9 9-1.1-6-3-7.9-9-9 6-1.1 7.9-3 9-9Z"/><path d="M6 1c.5 2.8 1.4 3.7 4.2 4.2C7.4 5.7 6.5 6.6 6 9.4 5.5 6.6 4.6 5.7 1.8 5.2 4.6 4.7 5.5 3.8 6 1Z"/><path d="M6 17c.6 3.4 1.7 4.5 5.1 5.1-3.4.6-4.5 1.7-5.1 5.1-.6-3.4-1.7-4.5-5.1-5.1C4.3 21.5 5.4 20.4 6 17Z"/></svg>;
}
