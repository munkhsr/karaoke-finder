import Link from 'next/link';
import { artists } from '../../lib/artists.mjs';
export const metadata = { title: 'Зургийн эх сурвалж — Karaoke Hub' };
export default function ImageCredits() {
  return <main className="credits-page"><Link href="/">← Нүүр хуудас</Link><h1>Зургийн эх сурвалж</h1><p>Дуучид, хамтлагуудын зураг болон ашиглах лиценз.</p><ul className="credits-list">{artists.map(artist=><li key={artist.id}><img src={artist.src} alt={artist.name} loading="lazy" width="90" height="90"/><div><h2>{artist.name}</h2>{artist.providedByUser?<p>Хэрэглэгчийн өгсөн зураг.</p>:<><p>Зохиогч: {artist.author}</p><p><a href={artist.source} target="_blank" rel="noreferrer">Wikimedia Commons эх сурвалж</a> · {artist.licenseUrl?<a href={artist.licenseUrl} target="_blank" rel="noreferrer">{artist.license}</a>:artist.license}</p><p>Commons-ийн жижиг хувилбарыг картын хүрээнд багтааж харуулсан. Өнгө, агуулгыг өөрчлөөгүй.</p></>}</div></li>)}</ul></main>;
}
