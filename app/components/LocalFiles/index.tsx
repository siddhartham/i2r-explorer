import React, { useState, useEffect } from 'react';
import styles from './localfiles.css';
import { bytesToSize, getFileType } from '../../utils/tools';

const LocalFiles = (props: any) => {
  const {
    getListAsync,
    selectFileAsync,
    favourites,
    favouritesCount,
    pathHistory,
    fileList,
    currentPath,
    s3State,
    uploadSelectedFiles,
    uploadQueue,
    uploadQueueCnt,
    abortUploadFile,
    progressPercent,
    totalProgressPercent,
    selectLocalFavFolder,
    removeLocalFavFolder,
    setLocalContext
  } = props;
  const [fetched, setFetched] = useState(false);
  const [cnt, setCnt] = useState(0);

  const [newPath, setNewPath] = useState('');

  useEffect(() => {
    if (!fetched) {
      getListAsync(props.currentPath, null);
      setFetched(true);
    }
  }, []);

  useEffect(() => {
    if (props.seletedFileTT !== cnt) {
      setCnt(props.seletedFileTT);
    }
  }, []);

  const listFavourites: Array<any> = [];
  for (let k = favouritesCount - 1; k > -1; k -= 1) {
    const v = favourites[k];
    listFavourites.push(
      <div
        role="navigation"
        key={`fav_folders_${k}`}
        className={`nav-group-item ${
          props.currentPath === v.path ? 'active' : ''
          }`}
        style={{ color: '#DDD', cursor: 'pointer' }}
      >

        <span onClick={() => getListAsync(v.path, null)} className={`icon ${v.icon}`} style={{ color: v.clr }}/>
        <span onClick={() => getListAsync(v.path, null)}>{v.name}</span>
        <span onClick={() => removeLocalFavFolder(v.path)} className="icon icon-minus-circled favRemove" style={{cursor: 'pointer', position: 'absolute', left: '0px'}} />
      </div>
    );
  }

  const listRecents: Array<any> = [];
  for (let i = pathHistory.length - 1; i > -1; i -= 1) {
    const v = pathHistory[i];
    const clr = (/(^|\/)\.[^\/\.]/g).test(v.path) ? '#555' : '#00bfff';
    const clrTxt = (/(^|\/)\.[^\/\.]/g).test(v.path) ? '#555' : '#DDD';
    listRecents.push(
      <span
        role="navigation"
        key={`recent_folders_${i}`}
        className={`nav-group-item ${
          props.currentPath === v.path ? 'active' : ''
          }`}
        onClick={() => getListAsync(v.path, v.name)}
        style={{ color: clrTxt, cursor: 'pointer' }}
      >
        <span className="icon icon-folder" style={{ color: clr }} />
        {v.name}
      </span>
    );
  }

  const listFiles: Array<any> = [];
  for (let i = 0; i < fileList.length; i += 1) {
    const v = fileList[i];
    const cls: string = v.isSelected ? styles.selectedFile : '';
    if (uploadQueueCnt > 0 && uploadQueue.lastIndexOf(v.path) !== -1) {
      const p = progressPercent[v.path];
      if(v.name && v.name.length > 0)
      listFiles.push(
        <tr key={`file_list_${i}`}>
          <td style={{ padding: '0px', textAlign: 'right', color: 'gray' }}>
            <span
              role="navigation"
              className="icon icon-cancel-circled"
              onClick={() => abortUploadFile(v.path)}
            />
          </td>
          <td style={{ paddingLeft: '10px' }} colSpan="3">
            <div className="progress" data-label={v.name}>
              <span className="value" style={{ width: `${p.percent}%` }} />
            </div>
          </td>
        </tr>
      );
    } else {
      const clr = (/(^|\/)\.[^\/\.]/g).test(v.name) ? '#555' : (v.isDir ? '#00bfff' : '#DDD');
      const clrTxt = (/(^|\/)\.[^\/\.]/g).test(v.name) ? '#555' : '#DDD';
      if(v.name && v.name.length > 0)
      listFiles.push(
        <tr
          role="link"
          key={`file_list_${i}`}
          className={cls}
          onClick={
            v.isDir
              ? () => getListAsync(v.path, v.name)
              : e => selectFileAsync(v.path, e.shiftKey)
          }
          onContextMenu={() => setLocalContext()}
        >
          <td style={{ padding: '0px', textAlign: 'right' }}>
            {v.isDir ? ( <span className="icon icon-folder" style={{ color: clr, fontSize: '18px' }} /> ) : ( <span className="icon icon-newspaper" style={{ color: clr, fontSize: '18px' }}/> )}
          </td>
          <td
            style={{
              paddingLeft: '10px',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            }}
          >
            {v.name}
          </td>
          <td
            style={{
              maxWidth: '150px',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            }}
          >
            {v.isDir ? '' : getFileType(v.extn)}
          </td>
          <td>{v.isDir ? '' : bytesToSize(v.size)}</td>
        </tr>
      );
    }
  }

  return (
    <div>
      <div className="toolbar">
        <div className="toolbar-actions" style={{ display: 'flex' }}>
          <input
            className="form-control"
            type="text"
            placeholder={currentPath}
            value={newPath}
            readOnly
            disabled
            // onChange={e => {
            //   setNewPath(e.target.value);
            // }}
            // onKeyDown={e => {
            //   if (e.key === 'Enter') {
            //     let p = `${newPath.replace(/\/$/, '')}`;
            //     if (p === '/') p = '';
            //     getListAsync(p);
            //     setNewPath('');
            //   }
            // }}
          />
          {(s3State === 'connected' || s3State === 'reloading') && (
            <button
              className="btn btn-large btn-positive pull-right"
              onClick={() => uploadSelectedFiles()}
              type="button"
              style={{
                width:
                  uploadQueueCnt > 0 && totalProgressPercent > 0
                    ? '150px'
                    : '110px'
              }}
            >
              <span
                className="icon icon-upload-cloud icon-text"
                style={{ color: '#fff' }}
              />{' '}
              Upload
              {uploadQueueCnt > 0 && totalProgressPercent > 0
                ? ` (${totalProgressPercent}%)`
                : ''}
            </button>
          )}
        </div>
      </div>
      <div className="pane-group" style={{ top: '40px' }}>
        <div className="pane-sm sidebar">
          <nav className="nav-group">
            <div className="nav-group-title" onClick={()=>selectLocalFavFolder()} style={{ fontSize: '100%', marginBottom: '5px' }}>
              Work Folders
              <span className="icon icon-plus-circled" onClick={()=>removeLocalFavFolder()} style={{color:"#fc605b", cursor: 'pointer', marginLeft: '5px'}} />
            </div>
            {listFavourites}
          </nav>
          <nav className="nav-group">
            <h5 className="nav-group-title" style={{ fontSize: '100%', marginBottom: '5px' }}>Recents</h5>
            {listRecents}
          </nav>
        </div>
        <div className="pane">
          <table className="table-striped">
            <thead>
              <tr>
                <th style={{ width: '16px' }}> </th>
                <th style={{ paddingLeft: '10px', width: '70%' }}>Name</th>
                <th style={{ width: '15%' }}>Kind</th>
                <th>Size</th>
              </tr>
            </thead>
            <tbody>{listFiles}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LocalFiles;
