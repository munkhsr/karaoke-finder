export default {
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/hit-songs.html', destination: '/hit-songs', permanent: true },
      { source: '/new-songs.html', destination: '/new-songs', permanent: true },
    ];
  },
};
