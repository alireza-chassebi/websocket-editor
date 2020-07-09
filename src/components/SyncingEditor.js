import React, { useState, useRef, useEffect } from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate';
import initialValue from '../util/initialValue';
import io from 'socket.io-client';
import { isKeyHotkey } from 'is-hotkey';
import { Button } from './Button';

const ENDPOINT = 'http://localhost:4000';

// create birdirectional connection between server and client
const socket = io(ENDPOINT);

// example provdided by slate.js for syncing editors
// https://github.com/ianstormtaylor/slate/blob/v0.47/examples/syncing-operations/index.js line 236

//define hotkey matchers
const isBoldHotkey = isKeyHotkey('mod+b');
const isItalicHotkey = isKeyHotkey('mod+i');
const isUnderlinedHotkey = isKeyHotkey('mod+u');
const isCodeHotkey = isKeyHotkey('mod+`');

const DEFAULT_NODE = 'paragraph';

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
    // listen for new-remote-operations event from server and apply changes to other editors in the group
    socket.on(eventName, ({ changedEditorId, ops }) => {
      if (id.current !== changedEditorId) {
        // needed to prevent onChange event from emitting another operations event when applyOperation is called
        remote.current = true;
        // copy changes from changed editor
        ops.forEach((op) => editor.current.applyOperation(op));
        remote.current = false;
      }
    });

    return () => socket.off(eventName);
  }, [groupId]);

  const handleChange = (options) => {
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
        ops: ops,
        value: options.value.toJSON(),
        groupId,
      });
    }
  };

  // check if the current selection has a mark with `type` in it
  const hasMark = (type) => {
    return value.activeMarks.some((node) => node.type === type);
  };

  // check if the any of the currently selected blocks are of `type`
  const hasBlock = (type) => {
    return value.blocks.some((node) => node.type === type);
  };

  // Render a mark-toggling toolbar button.
  const renderMarkButton = (type, button) => {
    const isActive = hasMark(type);

    return (
      <Button
        active={isActive}
        onMouseDown={(event) => onClickMark(event, type)}>
        {button}
      </Button>
    );
  };

  // render a block-toggling toolbar button
  const renderBlockButton = (type, button) => {
    let isActive = hasBlock(type);

    if (['numbered-list', 'bulleted-list'].includes(type)) {
      const { document, blocks } = value;
      if (blocks.size > 0) {
        const parent = document.getParent(blocks.first().key);
        isActive = hasBlock('list-item') && parent && parent.type === type;
      }
    }

    return (
      <Button
        active={isActive}
        onMouseDown={(event) => onClickBlock(event, type)}>
        {button}
      </Button>
    );
  };

  // render a slate block
  const renderBlock = (props, editor, next) => {
    const { attributes, children, node } = props;

    switch (node.type) {
      case 'block-quote':
        return <blockquote {...attributes}>{children}</blockquote>;
      case 'bulleted-list':
        return <ul {...attributes}>{children}</ul>;
      case 'heading-one':
        return <h1 {...attributes}>{children}</h1>;
      case 'heading-two':
        return <h2 {...attributes}>{children}</h2>;
      case 'list-item':
        return <li {...attributes}>{children}</li>;
      case 'numbered-list':
        return <ol {...attributes}>{children}</ol>;
      default:
        return next();
    }
  };

  // render slate mark
  const renderMark = (props, editor, next) => {
    const { children, mark, attributes } = props;

    switch (mark.type) {
      case 'bold':
        return <strong {...attributes}>{children}</strong>;
      case 'code':
        return <code {...attributes}>{children}</code>;
      case 'italic':
        return <em {...attributes}>{children}</em>;
      case 'underlined':
        return <u {...attributes}>{children}</u>;
      default:
        return next();
    }
  };

  // On key down, if it's a formatting command toggle a mark.
  const onKeyDown = (event, editor, next) => {
    let mark;

    if (isBoldHotkey(event)) {
      mark = 'bold';
    } else if (isItalicHotkey(event)) {
      mark = 'italic';
    } else if (isUnderlinedHotkey(event)) {
      mark = 'underlined';
    } else if (isCodeHotkey(event)) {
      mark = 'code';
    } else {
      return next();
    }

    event.preventDefault();
    editor.current.toggleMark(mark);
  };

  // when a mark button is clicked , toggle the current mark
  const onClickMark = (event, type) => {
    event.preventDefault();
    editor.current.toggleMark(type);
  };

  // When a block button is clicked, toggle the block type.
  const onClickBlock = (event, type) => {
    event.preventDefault();

    const { value } = editor.current;
    const { document } = value;

    // Handle everything but list buttons.
    if (type !== 'bulleted-list' && type !== 'numbered-list') {
      const isActive = hasBlock(type);
      const isList = hasBlock('list-item');

      if (isList) {
        editor.current
          .setBlocks(isActive ? DEFAULT_NODE : type)
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list');
      } else {
        editor.current.setBlocks(isActive ? DEFAULT_NODE : type);
      }
    } else {
      // Handle the extra wrapping required for list buttons.
      const isList = hasBlock('list-item');
      const isType = value.blocks.some((block) => {
        return !!document.getClosest(
          block.key,
          (parent) => parent.type === type
        );
      });

      if (isList && isType) {
        editor.current
          .setBlocks(DEFAULT_NODE)
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list');
      } else if (isList) {
        editor.current
          .unwrapBlock(
            type === 'bulleted-list' ? 'numbered-list' : 'bulleted-list'
          )
          .wrapBlock(type);
      } else {
        editor.current.setBlocks('list-item').wrapBlock(type);
      }
    }
  };

  return (
    <>
      <div style={styles.toolbar}>
        {renderMarkButton('bold', 'Bold')}
        {renderMarkButton('italic', 'Italic')}
        {renderMarkButton('underlined', 'Underline')}
        {renderMarkButton('code', 'code')}
        {renderBlockButton('heading-one', 'H1')}
        {renderBlockButton('heading-two', 'H2')}
        {renderBlockButton('block-quote', 'Quote')}
        {renderBlockButton('numbered-list', 'Numbered List')}
        {renderBlockButton('bulleted-list', 'Buletted List')}
      </div>
      <Editor
        placeholder="Enter some text"
        ref={editor}
        style={styles.editor}
        value={value}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        renderBlock={renderBlock}
        renderMark={renderMark}
      />
    </>
  );
};

const styles = {
  container: {},
  toolbar: {},
  editor: {
    backgroundColor: 'lightgrey',
    width: '80vw',
    height: '60vh',
    overflowY: 'scroll',
  },
};
