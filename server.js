const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const cors = require('cors');

let initialEditorValue = {
  document: {
    nodes: [
      {
        object: 'block',
        type: 'paragraph',
        nodes: [
          {
            object: 'text',
            text: '',
          },
        ],
      },
    ],
  },
};

const groupData = {};

// sockets

io.on('connection', (socket) => {
  // listen for new-operations event emitted from an editor
  socket.on('new-operations', (data) => {
    groupData[data.groupId] = data.value;
    // emit new-remote-operations to all editors
    io.emit(`new-remote-operations-${data.groupId}`, data);
  });
});

// http

//middleware
app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);
app.use(express.static(path.join(__dirname, 'build')));

app.get('/', (_, res) => {
  // try {
  //   res.sendFile(path.join(__dirname, 'build', 'index.html'));
  // } catch (error) {
  //   res.send(error.message);
  // }
  res.send('<h1>hi</h1>');
});

app.get('/groups/:id', (req, res) => {
  const { id } = req.params;
  if (!(id in groupData)) groupData[id] = initialEditorValue;
  res.send(groupData[id]);
});

app.get('*', (_, res) => {
  res.redirect('/');
});

const PORT = process.env.PORT || 4000;

http.listen(PORT);
