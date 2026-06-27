const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Hello Railway Test Server\n');
}).listen(process.env.PORT || 8000, '::', () => {
  console.log('Test server started on port', process.env.PORT || 8000);
});
