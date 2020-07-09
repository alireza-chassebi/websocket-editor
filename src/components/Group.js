import React from 'react';
import { SyncingEditor } from './SyncingEditor';
import { useParams } from 'react-router-dom';

export const Group = () => {
  const { groupId } = useParams();
  return (
    <div style={styles.container}>
      <h3 style={styles.groupHeader}>Group: {groupId}</h3>
      <SyncingEditor groupId={groupId} />
    </div>
  );
};

const styles = {
  groupHeader: {
    margin: '40px 0',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '0 10vw',
  },
};
