import { notFound } from 'next/navigation';
import catalogue from '../../../lib/catalogue.json';
import { songSlug, songUrl } from '../../../lib/song-links.mjs';
import KaraokeApp from '../../../components/KaraokeApp';

export async function generateStaticParams() { return []; }
const songs=new Map(catalogue.map(song=>[songSlug(song),song]));
export async function generateMetadata({params}) {
  const song=songs.get((await params).slug);
  if(!song)return {};
  return {
    title:`${song.title} — ${song.artist} | Караоке код — Karaoke Hub`,
    description:`${song.artist} — ${song.title} дууны караоке код. Код 1: ${song.code2||'Байхгүй'}, Код 2: ${song.code1||'Байхгүй'}. Кодоо хуулж дуулаарай.`,
    alternates:{canonical:songUrl(song)},
    openGraph:{title:`${song.title} — ${song.artist}`,url:songUrl(song)},
  };
}
export default async function Page({params}) {
  const song=songs.get((await params).slug);
  if(!song)notFound();
  return <KaraokeApp initialSong={song}/>;
}
