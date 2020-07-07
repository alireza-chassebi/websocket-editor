const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// sockets

io.on('connection', (socket) => {
  // listen for new-operations event emitted from editor
  socket.on('new-operations', (data) => {
    // emit new-remote-operations to all editors
    io.emit('new-remote-operations', data);
  });
});

// http

//middleware
app.use(express.static(path.join(__dirname, 'build')));

app.get('/', (_, res) => {
  // try {
  //   res.sendFile(path.join(__dirname, 'build', 'index.html'));
  // } catch (error) {
  //   res.send(error.message);
  // }
  res.send('<h1>hi</h1>');
});

app.get('*', (_, res) => {
  res.redirect('/');
});

const PORT = process.env.PORT || 4000;

http.listen(PORT);
