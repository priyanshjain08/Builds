require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { initSocket } = require('./src/sockets');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`SyncSpace API listening on http://localhost:${PORT}`);
});
