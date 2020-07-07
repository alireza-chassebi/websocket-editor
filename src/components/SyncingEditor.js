import React, { useState, useRef, useEffect } from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate';
import initialValue from '../util/initialValue';
import io from 'socket.io-client';

const ENDPOINT = 'http://localhost:4000';
const socket = io(ENDPOINT);

// example provdided by slate.js for syncing editors
// https://github.com/ianstormtaylor/slate/blob/v0.47/examples/syncing-operations/index.js line 236

export const SyncingEditor = ({ groupId }) => {
  const [value, setValue] = useState(initialValue);

  const id = useRef(`${Date.now()}`);
  const editor = useRef(null);
  const remote = useRef(false);

  useEffect(() => {
    fetch(`${ENDPOINT}/groups/${groupId}`)
      .then((data) => data.json())
      .then((value) => setValue(Value.fromJSON(value)))
      .catch((err) => alert(err.message));

    const eventName = `new-remote-operations-${groupId}`;
    // listen for new-remote-operations event from server and apply changes to other editors
    socket.on(eventName, ({ changedEditorId, ops }) => {
      if (id.current !== changedEditorId) {
        // needed to prevent onChange event from emitting another operations event when applyOperation is called
        remote.current = true;
        // copy changes from changed editor
        JSON.parse(ops).forEach((op) => editor.current.applyOperation(op));
        remote.current = false;
      }
    });

    return () => socket.off(eventName);
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
            value: options.value.toJSON(),
            groupId,
          });
        }
      }}
    />
  );
};

const style = {
  backgroundColor: 'lightgrey',
  width: '80vw',
  height: '40vh',
  overflowY: 'scroll',
};
