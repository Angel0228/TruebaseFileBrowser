import React from 'react';

/* Import all the required styles */
import 'rc-tree/assets/index.css';
import 'bootstrap/dist/css/bootstrap.css';
import './global.scss';

/* Import components */
import FileTree from './Components/FileTree';

function App() {
  return (
    <div className="container-fluid app">
      <FileTree />
    </div>
  );
}

export default App;
