export default {
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/hit-songs.html', destination: '/hit-songs', permanent: true },
      { source: '/new-songs.html', destination: '/', permanent: true },
      // The new songs list was removed; send old links to the homepage.
      { source: '/new-songs', destination: '/', permanent: true },
    ];
  },
};
