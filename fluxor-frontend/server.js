const handler = require('serve-handler');
const http = require('http');

const port = process.env.PORT || 3000;

const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: 'dist',
    rewrites: [
      { source: '**', destination: '/index.html' }
    ]
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Frontend running at http://0.0.0.0:${port}`);
});
