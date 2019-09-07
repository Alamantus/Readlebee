async function routes(fastify, options) {
  fastify.get('/', async (request, reply) => {
    const viewData = {};
    if (typeof request.query.loggedOut !== 'undefined') {
      viewData.message = 'You have been logged out';
    } else {
      viewData.message = request.isLoggedInUser ? JSON.stringify(fastify.jwt.decode(request.cookies.token)) : 'you are NOT logged in';
    }
    if (request.isLoggedInUser) {
      viewData.loggedIn = true;
      viewData.statuses = [{ title: 'books' }, { title: 'fun' }];
    }
    reply.view('home.hbs', viewData);
  });
}

module.exports = routes