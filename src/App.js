// Import React!
import React from 'react';
import { SyncingEditor } from './components/SyncingEditor';

export const App = () => {
  return (
    <div style={style}>
      <SyncingEditor />
      <br />
      <SyncingEditor />
      <br />
      <SyncingEditor />
    </div>
  );
};

const style = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};
