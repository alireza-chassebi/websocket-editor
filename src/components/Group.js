import React from 'react';
import { SyncingEditor } from './SyncingEditor';
import { useParams } from 'react-router-dom';

export const Group = () => {
  const { groupId } = useParams();
  return (
    <div style={styles.container}>
      <h1>Group: {groupId}</h1>
      <div style={styles.editorWrapper}>
        <SyncingEditor groupId={groupId} />
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
};
