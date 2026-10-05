export default function manifest() {
  return {
    name:'Karaoke Hub', short_name:'Karaoke Hub',
    description:'Дуугаа хай → Кодоо ол → Дуул',
    start_url:'/', scope:'/', display:'standalone', lang:'mn',
    background_color:'#050a11', theme_color:'#050a11',
    icons:[192,512].map(size=>({src:`/assets/app-icon-${size}.png`,sizes:`${size}x${size}`,type:'image/png'})),
  };
}
