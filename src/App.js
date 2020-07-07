// Import React!
import React, { useState } from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate';

// https://github.com/ianstormtaylor/slate/blob/v0.47/examples/syncing-operations/index.js

const initialValue = Value.fromJSON({
  document: {
    nodes: [
      {
        object: 'block',
        type: 'paragraph',
        nodes: [
          {
            object: 'text',
            text: 'A line of text in a paragraph.',
          },
        ],
      },
    ],
  },
});

export const App = () => {
  const [value, setValue] = useState(initialValue);

  return (
    <Editor value={value} onChange={(options) => setValue(options.value)} />
  );
};
