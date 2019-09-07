async function routes(fastify, options) {
  fastify.get('/styles/:css', async (request, reply) => {
    reply.sendFile('css/' + request.params.css);
  });

  fastify.get('/images/:image', async (request, reply) => {
    reply.sendFile('images/' + request.params.image);
  });

  fastify.get('/manifest.webmanifest', async (request, reply) => {
    const manifest = {
      name: typeof fastify.siteConfig !== 'undefined' ? fastify.siteConfig.siteName : 'book-tracker',
      short_name: typeof fastify.siteConfig !== 'undefined' ? fastify.siteConfig.siteName : 'book-tracker',
      icons: [
        {
          src: '/images/icon-128.png',
          sizes: '128x128',
          type: 'image/png',
        },
        {
          src: '/images/icon-144.png',
          sizes: '144x144',
          type: 'image/png',
        },
        {
          src: '/images/icon-152.png',
          sizes: '152x152',
          type: 'image/png',
        },
        {
          src: '/images/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/images/icon-256.png',
          sizes: '256x256',
          type: 'image/png',
        },
        {
          src: '/images/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
        }
      ],
      start_url: '/',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#000000',
      theme_color: '#1C4AFF',
    };

    return JSON.stringify(manifest);
  });
}

module.exports = routes