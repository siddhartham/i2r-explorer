import React, { useState, useEffect } from 'react';
import LocalFiles from '../LocalFiles';
import Header from '../Header';
import Footer from '../Footer';
import S3Files from '../S3Files';

const { ipcRenderer } = require('electron');

const Home = (props: any) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptValue, setPromptValue] = useState('');
  const [promptProp, setPromptProp] = useState({ name: '', action: '' });

  const onPromptOk = () => {
    switch (promptProp.action) {
      case 'CreateLocalFolder':
        props.createLocalFolder(promptValue);
        break;
      case 'CreateS3Folder':
        props.createS3Folder(promptValue);
        break;
      default:
        break;
    }
    setShowPrompt(false);
  };

  useEffect(() => {
    ipcRenderer.on('CTX_S3_UPLOAD_FILES', (_event: any) => {
      props.uploadSelectedFiles();
    });
    ipcRenderer.on('S3_UPLOAD_COMPLETE', (_event: any, arg: any) => {
      props.markUploadComplete(arg.filePath);
      props.reloadS3ListAsync();
      props.addToTransferLog({
        type: 'Upload',
        completed_at: Date.now(),
        status: 'Completed',
        local: arg.filePath,
        s3: arg.s3Path
      });
    });
    ipcRenderer.on('S3_UPLOAD_CANCEL', (_event: any, arg: any) => {
      props.markUploadComplete(arg.filePath);
      props.reloadS3ListAsync();
      props.addToTransferLog({
        type: 'Upload',
        completed_at: Date.now(),
        status: (arg.error ? 'Error' : 'Canceled'),
        local: arg.filePath,
        s3: arg.s3Path,
        msg: arg.error
      });
      if(arg.error) alert(arg.error);
    });
    ipcRenderer.on('S3_UPLOAD_PROGRESS', (_event: any, arg: any) => {
      props.setProgressPercent(arg.filePath, arg.loaded, arg.progress);
    });

    ipcRenderer.on('CTX_S3_DOWNLOAD_FILES', (_event: any) => {
      props.downloadSelectedFiles();
    });
    ipcRenderer.on('S3_DOWNLOAD_COMPLETE', (_event: any, arg: any) => {
      props.reloadS3ListAsync();
      props.getListAsync();
      props.addToTransferLog({
        type: 'Download',
        completed_at: Date.now(),
        status: 'Completed',
        s3: arg.s3Path,
        local: arg.filePath
      });
    });
    ipcRenderer.on('S3_DOWNLOAD_CANCEL', (_event: any, arg: any) => {
      props.reloadS3ListAsync();
      props.getListAsync();
      props.addToTransferLog({
        type: 'Download',
        completed_at: Date.now(),
        status: (arg.error ? 'Error' : 'Canceled'),
        s3: arg.s3Path,
        local: arg.filePath
      });
      if(arg.error) alert(arg.error);
    });

    ipcRenderer.on('CTX_S3_DELETE_FILES', (_event: any) => {
      props.deleteSelectedS3Files();
    });
    ipcRenderer.on('S3_DELETE_COMPLETE', (_event: any, arg: any) => {
      props.reloadS3ListAsync();
      props.addToTransferLog({
        type: 'Delete',
        completed_at: Date.now(),
        status: 'Completed',
        s3: arg.s3Path
      });
    });
    ipcRenderer.on('S3_DELETE_CANCEL', (_event: any, arg: any) => {
      props.reloadS3ListAsync();
      props.addToTransferLog({
        type: 'Delete',
        completed_at: Date.now(),
        status: (arg.error ? 'Error' : 'Canceled'),
        s3: arg.s3Path
      });
      if(arg.error) alert(arg.error);
    });

    ipcRenderer.on('CTX_S3_CREATE_FOLDER', (_event: any) => {
      setPromptValue('');
      setShowPrompt(true);
      setPromptProp({ name: 'Folder Name', action: 'CreateS3Folder' });
    });
    ipcRenderer.on('S3_FOLDER_CREATE_COMPLETE', (_event: any, arg: any) => {
      props.reloadS3ListAsync();
      props.addToTransferLog({
        type: 'Create Folder',
        completed_at: Date.now(),
        status: 'Completed',
        s3: arg.s3Path
      });
    });
    ipcRenderer.on('S3_FOLDER_CREATE_CANCEL', (_event: any, arg: any) => {
      props.reloadS3ListAsync();
      props.addToTransferLog({
        type: 'Create Folder',
        completed_at: Date.now(),
        status: (arg.error ? 'Error' : 'Canceled'),
        s3: arg.s3Path
      });
      if(arg.error) alert(arg.error);
    });

    ipcRenderer.on('CTX_LOCAL_DELETE_FILES', (_event: any) => {
      props.deleteSelectedLocalFiles();
    });
    ipcRenderer.on('CTX_LOCAL_CREATE_FOLDER', (_event: any) => {
      setPromptValue('');
      setShowPrompt(true);
      setPromptProp({ name: 'Folder Name', action: 'CreateLocalFolder' });
    });

    ipcRenderer.on('CTX_LOCAL_RELOAD_FILES', (_event: any) => {
      props.getListAsync();
    });
    ipcRenderer.on('CTX_S3_RELOAD_FILES', (_event: any) => {
      props.reloadS3ListAsync();
    });

    ipcRenderer.on('LOCAL_FILES_LIST_COMPLETE', (_event: any, arg: any) => {
      props.listLocalComplete(arg);
    });
    ipcRenderer.on('LOCAL_FILES_DELETE_COMPLETE', (_event: any, arg: any) => {
      props.getListAsync();
      props.addToTransferLog({
        type: 'Delete',
        completed_at: Date.now(),
        status: 'Completed',
        local: arg.pth
      });
    });
    ipcRenderer.on('LOCAL_FOLDER_CREATE_COMPLETE', (_event: any, arg: any) => {
      props.getListAsync();
      props.addToTransferLog({
        type: 'Create',
        completed_at: Date.now(),
        status: 'Completed',
        local: arg.pth
      });
    });
    ipcRenderer.on('LOCAL_SELECT_FOLDER_DONE', (_event: any, arg: any) => {
      props.addToFavFolders(arg);
    });
  }, []);
  return (
    <div className="window">
      {showPrompt && (
        <>
          <div className="overlay" />
          <div id="myModal" className="modal">
            <div className="modal-content">
              <span
                className="close"
                onClick={() => {
                  setShowPrompt(false);
                }}
              >
                &times;
              </span>
              <div>
                <form>
                  <div className="form-group">
                    <label>{promptProp.name}</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={promptProp.name}
                      value={promptValue}
                      onChange={e => setPromptValue(e.target.value)}
                    />
                  </div>
                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn btn-form btn-primary"
                      onClick={() => {
                        onPromptOk();
                      }}
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      className="btn btn-form btn-default"
                      onClick={() => {
                        setShowPrompt(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      <Header />
      <div className="window-content">
        <div className="pane-group">
          <div
            className="pane"
            style={{ overflow: 'hidden' }}
          >
            <LocalFiles {...props} />
          </div>
          <div
            className="pane"
            style={{ overflow: 'hidden' }}
          >
            <S3Files {...props} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default Home;
