const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server);
const os = require('os');
const pty = require('node-pty');

app.use('/lib', express.static(__dirname + '/node_modules'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/test', (req, res) => {
  res.sendFile(__dirname + '/test.html');
})

const shell = os.platform() === 'win32' ? 'ps' : '/bin/bash';
io.on('connection', (socket) => {
  console.log(`Connected user: ${socket.id}`);

  const term = pty.spawn(shell, [], {
    name: 'SocketTerm' + socket.id,
    cwd: process.env.HOME,
    env: process.env,
  });

  term.on('data', (data) => {
    socket.emit('terminal_output', data);
  });

  socket.on('terminal_write', (data) => {
    console.log(data)
    term.write(data);
  });

  socket.on('disconnect', (data) => {
    console.log(`Disconnected user: ${socket.id}`);
    term.destroy()
  });
});

server.listen(3000, () => {
  console.log('listening on http://localhost:3000');
});