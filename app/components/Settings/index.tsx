import React, { useState } from 'react';
import Header from '../Header';
import Footer from '../Footer';

const Settings = (props: any) => {
  const { transferLogs, autoConnectSetting, notifyOnUpload, notifyOnDownload } = props;

  const [tab, setTab] = useState('connection');
  const transferlogItems: Array<any> = [];
  if (transferLogs) {
    let i = 0;
    transferLogs.forEach((tl: any) => {
      const d = new Date(tl.completed_at).toUTCString();
      transferlogItems.push(
        <tr key={`tl_${i}`}>
          <td>{tl.type}</td>
          <td>{tl.status}</td>
          <td>{d}</td>
          <td>{tl.s3}</td>
          <td>{tl.local}</td>
          <td>{tl.msg}</td>
        </tr>
      )
      i += 1;
    });
  }
  return (
    <div className="window">
      <Header />
      <div className="window-content">
        <div className="pane-group">
          <div className="pane-sm sidebar">
            <nav className="nav-group">
              <h5 className="nav-group-title">Explorer</h5>
              <div
                className={`nav-group-item ${
                  tab === 'connection' ? 'active' : ''
                  }`}
                onClick={() => setTab('connection')}
                style={{ color: '#DDD' }}
              >
                <span className="icon icon-cloud-thunder" style={{ color: '#DDD' }}/>
                Connection
              </div>
              <div
                className={`nav-group-item ${
                  tab === 'transfers' ? 'active' : ''
                  }`}
                onClick={() => setTab('transfers')}
                style={{ color: '#DDD' }}
              >
                <span className="icon icon-menu" style={{ color: '#DDD' }}/>
                Logs
              </div>
            </nav>
          </div>
          <div className="pane">
            {tab === 'connection' && (
              <form style={{ padding: '20px' }}>
                <div className="form-group">
                  <h5>S3 Credentials</h5>
                  <div className="radio">
                    <label>
                      <input type="radio" name="radios" value="auto" defaultChecked={autoConnectSetting === 'auto'} onClick={() => props.saveSettings({ autoConnectSetting: 'auto' })} />
                      Auto connect on launch
                    </label>
                  </div>
                  <div className="radio">
                    <label>
                      <input type="radio" name="radios" value="saveonly" defaultChecked={autoConnectSetting === 'saveonly'} onClick={() => props.saveSettings({ autoConnectSetting: 'saveonly' })} />
                      Remember the credentials but do not auto connect
                    </label>
                  </div>
                  <div className="radio">
                    <label>
                      <input type="radio" name="radios" value="clear" defaultChecked={autoConnectSetting === 'clear'} onClick={() => props.saveSettings({ autoConnectSetting: 'clear' })} />
                      Do not remember credentials
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <h5>Notifications</h5>
                  <div className="checkbox">
                    <label>
                      <input type="checkbox" defaultChecked={notifyOnUpload} onClick={() => props.saveSettings({ notifyOnUpload: !notifyOnUpload })} />
                      Notify on upload complete
                    </label>
                  </div>
                  <div className="checkbox">
                    <label>
                      <input type="checkbox" defaultChecked={notifyOnDownload} onClick={() => props.saveSettings({ notifyOnDownload: !notifyOnDownload })} />
                      Notify on download complete
                    </label>
                  </div>
                </div>
              </form>
            )}

            {tab === 'transfers' && (
              <table className="table-striped">
                <thead>
                  <tr>
                    <th style={{width: '5%'}}>Action</th>
                    <th style={{width: '5%'}}>Status</th>
                    <th style={{width: '5%'}}>Completed At</th>
                    <th style={{width: '35%'}}>S3 Path</th>
                    <th style={{width: '35%'}}>Local Path</th>
                    <th style={{width: '15%'}}>{' '}</th>
                  </tr>
                </thead>
                <tbody>
                  {transferlogItems.reverse()}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default Settings;
