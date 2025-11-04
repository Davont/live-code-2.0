import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import ErrorDisplay from './components/ErrorDisplay';
import CodeEditor from './components/CodeEditor';
import Preview from './components/Preview';
import { useTranspiledBundle } from './hooks/useTranspiledBundle';

const initialCode = `
// 直接写你的组件，无需 import 和渲染代码
const { useState } = React;

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Hello from Live Code!</h1>
      <p>直接写组件，自动渲染</p>
      <button onClick={() => setCount(c => c + 1)}>
        点击次数: {count}
      </button>
    </div>
  );
}
`.trim();


function App() {
  const [editorCode, setEditorCode] = useState(initialCode);
  const [submittedCode, setSubmittedCode] = useState(initialCode);
  const { bundle, error, isLoading } = useTranspiledBundle(submittedCode);
  const [isEditorVisible, setIsEditorVisible] = useState(true);

  const handleRunClick = useCallback(() => {
    setSubmittedCode(editorCode);
  }, [editorCode]);

  const toggleEditorVisibility = () => {
    setIsEditorVisible(!isEditorVisible);
  };

  return (
    <div className="app-container">
      <div className={`editor-pane ${!isEditorVisible ? 'hidden' : ''}`}>
        <CodeEditor code={editorCode} onCodeChange={setEditorCode} />
        <div className="editor-footer">
          <button onClick={handleRunClick} className="run-button">Run</button>
        </div>
      </div>
      <div className={`preview-container ${!isEditorVisible ? 'fullscreen' : ''}`}>
        <ErrorDisplay error={error} />
        <Preview
          code={bundle ?? ''}
          onError={() => {}}
          isLoading={isLoading}
          isEditorVisible={isEditorVisible}
          onToggleEditor={toggleEditorVisibility}
        />
      </div>
    </div>
  );
}

export default App;
