import KaraokeApp from '../../components/KaraokeApp';
export const metadata = { title: 'Дуртай дуунууд — Karaoke Hub', robots:{index:false,follow:true} };
export default function Page() { return <KaraokeApp key="favorites" group="favorites" />; }
