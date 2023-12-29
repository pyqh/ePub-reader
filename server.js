const http = require('http');
const fs = require('fs');
const path = require('path');

const getContentType = (filePath) => {
  const extname = path.extname(filePath);
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.gif': 'image/gif',
    '.epub': 'application/epub+zip',
  };
  return mimeTypes[extname] || 'text/plain';
};

const server = http.createServer((req, res) => {
  const filePath = path.join(__dirname, req.url === '/' ? 'index.html' : decodeURI(req.url));

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    res.writeHead(200, { 'Content-Type': getContentType(filePath) });
    res.end(data);
  });
});

server.listen(8080, () => {
  console.log('Server running at http://localhost:8080/');
});
