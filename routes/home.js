async function routes(fastify, options) {
  fastify.get('/', async (request, reply) => {
    reply.view('home.hbs', { text: request.isLoggedInUser ? JSON.stringify(fastify.jwt.decode(request.cookies.token)) : 'you are NOT logged in' });
  });
  
  fastify.get('/loggedin', async (request, reply) => {
    const token = fastify.jwt.sign({ loggedin: true });
    const expireTime = fastify.siteConfig.tokenExpireDays * (24 * 60 * 60e3);  // The section in parentheses is milliseconds in a day
    reply
      .setCookie('token', token, {
        path: '/',
        expires: new Date(Date.now() + expireTime),
        maxAge: new Date(Date.now() + expireTime),  // Both are set as a "just in case"
        httpOnly: true, // Prevents JavaScript on the front end from grabbing it
        sameSite: true, // Prevents the cookie from being used outside of this site
      })
      .view('home-logged-in.hbs', { statuses: [{ title: 'books' }, { title: 'fun' }] });
  });
  
  fastify.get('/loggedout', async (request, reply) => {
    reply.clearCookie('token', { path: '/' }).redirect('/');
  });
}

module.exports = routes