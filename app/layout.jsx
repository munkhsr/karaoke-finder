import './globals.css';
import PromoBanner from '../components/PromoBanner';
import InstallApp from '../components/InstallApp';
export const metadata = {
  title: 'Караоке дууны код хайх — Karaoke Hub',
  description: 'Монгол караоке дууны кодыг дууны нэр, дуучин эсвэл кодоор хай. Хит болон шинэ дуунуудын Код 1, Код 2-ыг олж, хуулж, дуртай дуундаа хадгалаарай.',
  robots: { index:true, follow:true },
  openGraph: { title:'Караоке дууны код хайх — Karaoke Hub', description:'Монгол дууны караоке код, хит болон шинэ дуунуудыг хурдан хайж олоорой.', siteName:'Karaoke Hub', locale:'mn_MN', type:'website' },
  icons: { apple:'/apple-touch-icon.png', icon:'/assets/app-icon-192.png' },
};
export const viewport = { themeColor: '#050a11', width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }) {
  return <html lang="mn"><body>{children}<PromoBanner/><InstallApp/></body></html>;
}
