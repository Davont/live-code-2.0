import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import ErrorDisplay from './components/ErrorDisplay';
import CodeEditor from './components/CodeEditor';
import Preview from './components/Preview';
import { useTranspiledBundle } from './hooks/useTranspiledBundle';

const initialCode = `
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Hello from esbuild!</h1>
      <p>This is bundled in a Web Worker.</p>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      <p>Try adding an import from a CDN!</p>
    </div>
  );
}

// The sandboxed code now receives \`shadowRoot\` as an argument from the executor.
const container = shadowRoot.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);
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
