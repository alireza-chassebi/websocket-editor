import React, { useEffect, useMemo, useState } from 'react';
import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';

import './App.css';

const App = () => {
  // Create a Slate editor object that won't change across renders.
  const editor = useMemo(() => withReact(createEditor()), []);
  // Keep track of state for the value of the editor.
  const [value, setValue] = useState([
    {
      type: 'paragraph',
      children: [{ text: 'Replace Text :)' }],
    },
  ]);
  return (
    // slate context provider for children components
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => setValue(newValue)}>
      <Editable />
    </Slate>
  );
};
export default App;
