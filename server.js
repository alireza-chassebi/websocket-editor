const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

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

// could potentially add persistence since too many concurrent users would deplete the RAM and make the app crash
let groupData = {};
// since there is no persistence clear groupData every 6 hours
const clearDataInterval = 60000 * 60 * 6;

setInterval(() => {
  groupData = {};
}, clearDataInterval);

// websockets

io.on('connection', (socket) => {
  // listen for new-operations event emitted from an editor
  socket.on('new-operations', (data) => {
    groupData[data.groupId] = data.value;
    // emit new-remote-operations to all editors in specific group
    io.emit(`new-remote-operations-${data.groupId}`, data);
  });
});

// http

// cors middleware needed in development
if (process.env.NODE_ENV === 'development') {
  const cors = require('cors');
  app.use(
    cors({
      origin: 'http://localhost:3000',
    })
  );
}

app.use(express.static(path.join(__dirname, 'build')));

app.get('/api/groups/:id', (req, res) => {
  const { id } = req.params;
  if (!(id in groupData)) groupData[id] = initialEditorValue;
  res.send(groupData[id]);
});

app.get('/*', (_, res) => {
  try {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  } catch (error) {
    res.send(error.message);
  }
});

const PORT = process.env.PORT || 4000;

http.listen(PORT);
