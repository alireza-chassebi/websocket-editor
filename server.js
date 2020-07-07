const express = require('express');
const path = require('path');

const app = express();

//middleware
app.use(express.static(path.join(__dirname, 'build')));

app.get('/', (_, res) => {
  try {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  } catch (error) {
    res.send(error.message);
  }
});

app.get('*', (_, res) => {
  res.redirect('/');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT);
