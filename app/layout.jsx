import './globals.css';
import InstallApp from '../components/InstallApp';
import Script from 'next/script';
import { measurementId } from '../lib/analytics.mjs';
export const metadata = {
  metadataBase: new URL('https://www.karaokehub.mn'),
  verification: { google:'vYJ8OHQNL6scqtTiMRVeI6Qbt8HUnCEy0T-mdvSM6Zs' },
  title: 'Караоке дууны код хайх — Karaoke Hub',
  description: 'Монгол караоке дууны кодыг дууны нэр, дуучин эсвэл кодоор хай. Хит болон шинэ дуунуудын Код 1, Код 2-ыг олж, хуулж, дуртай дуундаа хадгалаарай.',
  robots: { index:true, follow:true },
  openGraph: { title:'Караоке дууны код хайх — Karaoke Hub', description:'Монгол дууны караоке код, хит болон шинэ дуунуудыг хурдан хайж олоорой.', siteName:'Karaoke Hub', locale:'mn_MN', type:'website' },
  icons: { apple:'/apple-touch-icon.png', icon:'/assets/app-icon-192.png' },
};
export const viewport = { themeColor: '#050a11', width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }) {
  return <html lang="mn"><body>{children}<InstallApp/>
    <Script id="google-analytics-init" strategy="afterInteractive">{`
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
      window.gtag('js', new Date());
      window.gtag('config', '${measurementId}');
    `}</Script>
    <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive"/>
  </body></html>;
}
