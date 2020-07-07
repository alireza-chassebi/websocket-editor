import React, { useState, useRef, useEffect } from 'react';
import { Editor } from 'slate-react';
import initialValue from '../util/initialValue';
import Mitt from 'mitt';

// https://github.com/ianstormtaylor/slate/blob/v0.47/examples/syncing-operations/index.js line 236

const emitter = new Mitt();

export const SyncingEditor = () => {
  const [value, setValue] = useState(initialValue);

  const id = useRef(`${Date.now()}`);
  const editor = useRef(null);
  const remote = useRef(false);

  useEffect(() => {
    // listen for all emitted events
    emitter.on('*', (changedEditorId, ops) => {
      if (id.current !== changedEditorId) {
        // needed to prevent onChange event from emitting another operation event when applyOperation is called
        remote.current = true;
        // copy changes from changed editor
        ops.forEach((op) => editor.current.applyOperation(op));
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

        //emit event
        if (ops.length && !remote.current) {
          emitter.emit(id.current, ops);
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
