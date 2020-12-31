import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { TreeEditor } from './tree-editor';

function App() {
  return (
    <div className="App">
      <TreeEditor />
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);