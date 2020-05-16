import React, { useState, useEffect } from 'react';
import styles from './s3files.css';
import { bytesToSize, getFileType } from '../../utils/tools';

const S3Files = (props: any) => {
  const {
    disconnectS3,
    saveS3ConfAsync,
    selectS3FileAsync,
    getS3ListAsync,
    getS3UpAsync,
    s3Conf,
    s3State,
    s3FileList,
    s3Path,
    autoConnectSetting,
    setS3Context
  } = props;

  const [awsKey, setAwsKey] = useState(s3Conf.awsKey);
  const [secretKey, setSecretKey] = useState(s3Conf.secretKey);
  const [bucket, setBucket] = useState(s3Conf.bucket);
  const [region, setRegion] = useState('us-east-1');
  const [acl, setAcl] = useState('');
  const [storageClass, setStorageClass] = useState('');
  const [encryption, setEncryption] = useState(false);

  const [connected, setConnected] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [cnt, setCnt] = useState(0);

  const [newPath, setNewPath] = useState(s3Path);

  useEffect(() => {
    if (
      !connected &&
      s3Conf.awsKey &&
      s3Conf.awsKey.length > 0 &&
      autoConnectSetting === 'auto'
    ) {
      saveS3ConfAsync(s3Conf);
      setConnected(true);
    }
  }, []);

  useEffect(() => {
    if (!fetched && s3State === 'connected') {
      getS3ListAsync('');
      setFetched(true);
    }
  }, []);

  useEffect(() => {
    if (props.seletedS3FileTT !== cnt) {
      setCnt(props.seletedS3FileTT);
    }
  }, []);

  if (s3State === 'connecting') {
    return (
      <div className="pane-group">
        <div className="pane">
          <div className="loaderDiv">
            <div className="lds-ellipsis">
              <div />
              <div />
              <div />
              <div />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (s3State === 'connected' || s3State === 'reloading') {
    const listFiles = [];
    for (let i = 0; i < s3FileList.length; i += 1) {
      const v = s3FileList[i];
      const clr = (/(^|\/)\.[^\/\.]/g).test(v.name) ? '#555' : (v.isDir ? '#00bfff' : '#DDD');
      const clrTxt = (/(^|\/)\.[^\/\.]/g).test(v.name) ? '#555' : '#DDD';
      if(v.name && v.name.length > 0)
      listFiles.push(
        <tr
          key={`file_list_${i}`}
          onClick={
            v.isDir
              ? () => getS3ListAsync(v.path)
              : e => selectS3FileAsync(v.path, e.shiftKey)
          }
          onContextMenu={() => setS3Context()}
          className={v.isSelected ? styles.selectedFile : ''}
          style={{ color: clrTxt }}
        >
          <td style={{ padding: '0px', textAlign: 'right', color: 'gray' }}>
            {v.isDir ? (
              <span
                className="icon icon-folder"
                style={{ color: clr, fontSize: '18px' }}
              />
            ) : (
              <span
                className="icon icon-newspaper"
                style={{ color: clr, fontSize: '18px' }}
              />
            )}
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

    return (
      <div>
        {s3State === 'reloading' && (
          <div className="loaderDiv" style={{ top: '40px' }}>
            <div className="lds-ellipsis">
              <div />
              <div />
              <div />
              <div />
            </div>
          </div>
        )}
        <div className="toolbar">
          <div className="toolbar-actions" style={{ display: 'flex' }}>
            <input
              className="form-control"
              type="text"
              placeholder={`/${s3Path}`}
              value={newPath}
              onChange={e => {
                setNewPath(e.target.value);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  let p = `${newPath.replace(/^\/|\/$/g, '')}/`;
                  if (p === '/') p = '';
                  getS3ListAsync(p);
                  setNewPath('');
                }
              }}
            />
            <button
              className="btn btn-large btn-negative pull-right"
              onClick={() => disconnectS3()}
              type="button"
              style={{ width: '120px' }}
            >
              <span
                className="icon icon-logout icon-text"
                style={{ color: '#fff' }}
              />{' '}
              Disconnect
            </button>
          </div>
        </div>
        <div className="pane-group" style={{ top: '40px' }}>
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
              <tbody>
                {s3Path !== '' && (
                  <tr key="file_list_start" onClick={() => getS3UpAsync()}>
                    <td colSpan="4">
                      <span
                        className="icon icon-reply-all"
                        style={{ color: 'dimgrey', fontSize: '18px' }}
                      />
                    </td>
                  </tr>
                )}
                {listFiles}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.S3Form}>
      <form>
        <div className="form-group">
          <div>Access Key</div>
          <input
            type="text"
            name="awsKey"
            className="form-control"
            placeholder="Access Key"
            value={awsKey}
            onChange={e => setAwsKey(e.target.value)}
          />
        </div>
        <div className="form-group">
          <div>Secret Key</div>
          <input
            type="text"
            name="secretKey"
            className="form-control"
            placeholder="Secret Key"
            value={secretKey}
            onChange={e => setSecretKey(e.target.value)}
          />
        </div>
        <div className="form-group">
          <div>Bucket</div>
          <input
            type="text"
            name="bucket"
            className="form-control"
            placeholder="Bucket"
            value={bucket}
            onChange={e => setBucket(e.target.value)}
          />
        </div>
        <div className="form-group">
          <div>Region</div>
          <input
            type="text"
            name="region"
            className="form-control"
            placeholder="Region"
            value={region}
            onChange={e => setRegion(e.target.value)}
          />
        </div>
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-large btn-form btn-primary"
            onClick={() =>
              saveS3ConfAsync({
                awsKey,
                secretKey,
                bucket,
                region,
                acl,
                storageClass,
                encryption
              })
            }
          >
            Connect
          </button>
        </div>
      </form>
    </div>
  );
};

export default S3Files;
