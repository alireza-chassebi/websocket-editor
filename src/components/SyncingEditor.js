import React, { useState, useRef, useEffect } from 'react';
import { Editor } from 'slate-react';
import initialValue from '../util/initialValue';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

// example provdided by slate.js for syncing editors
// https://github.com/ianstormtaylor/slate/blob/v0.47/examples/syncing-operations/index.js line 236

export const SyncingEditor = () => {
  const [value, setValue] = useState(initialValue);

  const id = useRef(`${Date.now()}`);
  const editor = useRef(null);
  const remote = useRef(false);

  useEffect(() => {
    // listen for new-remote-operations event from server and apply changes to other editors
    socket.on('new-remote-operations', ({ changedEditorId, ops }) => {
      if (id.current !== changedEditorId) {
        // needed to prevent onChange event from emitting another operations event when applyOperation is called
        remote.current = true;
        // copy changes from changed editor
        JSON.parse(ops).forEach((op) => editor.current.applyOperation(op));
        remote.current = false;
      }
    });
  }, []);

  return (
    <Editor
      ref={editor}
      style={style}
      value={value}
      onChange={(options) => {
        setValue(options.value);
        const ops = options.operations
          .filter((o) => {
            if (o) {
              return (
                o.type !== 'set_selection' &&
                o.type !== 'set_value' &&
                (!o.data || !o.data.has('source'))
              );
            }
            return false;
          })
          .toJS() // deep copy of array
          .map((o) => ({ ...o, data: { source: 'one' } }));

        //emit event to server
        if (ops.length && !remote.current) {
          socket.emit('new-operations', {
            changedEditorId: id.current,
            ops: JSON.stringify(ops),
          });
        }
      }}
    />
  );
};

const style = {
  backgroundColor: 'lightgrey',
  width: '80vw',
  height: '30vh',
};
