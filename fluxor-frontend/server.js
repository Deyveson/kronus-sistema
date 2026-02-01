const handler = require('serve-handler');
const http = require('http');

const port = process.env.PORT || 3000;

const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: 'dist/fluxor-atendimento/browser',
    rewrites: [
      { source: '**', destination: '/index.html' }
    ]
  });
});

server.listen(port, () => {
  console.log(`Frontend running at http://localhost:${port}`);
});
