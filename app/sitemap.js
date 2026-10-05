export default function sitemap() {
  return ['/', '/hit-songs', '/new-songs', '/image-credits'].map(path => ({
    url: `https://www.karaokehub.mn${path}`,
  }));
}
