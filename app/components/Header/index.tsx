import React from 'react';

import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const l = useLocation().pathname;
  console.log("Path", l);
  return (
    <header className="toolbar toolbar-header">
      <div className="toolbar-actions">
        <div className="btn-group">
          <Link to="/" className={`btn btn-default ${l==='/' ? 'active' : ''}`} style={{ textDecoration: 'none' }}>
            <span className="icon icon-layout icon-text" />
            Explorer
          </Link>
          <Link to="/settings" className={`btn btn-default ${l==='/settings' ? 'active' : ''}`} style={{ textDecoration: 'none' }}>
            <span className="icon icon-cog icon-text" />
            Settings
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
