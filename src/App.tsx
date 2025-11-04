import { useState, useCallback } from 'react';
import './App.css';
import ErrorDisplay from './components/ErrorDisplay';
import CodeEditor from './components/CodeEditor';
import Preview from './components/Preview';
import { useTranspiledBundle } from './hooks/useTranspiledBundle';

const initialCode = `
// 直接写你的组件，无需 import 和渲染代码
const { useState } = React;
const { IntlProvider, FormattedMessage, FormattedNumber } = ReactIntl;

function App() {
  const [locale, setLocale] = useState('zh');
  
  const messages = {
    zh: {
      greeting: '你好，欢迎使用 Live Code!',
      description: '这是一个国际化示例',
      count: '当前计数',
    },
    en: {
      greeting: 'Hello, Welcome to Live Code!',
      description: 'This is an i18n example',
      count: 'Current count',
    },
  };
  
  const [count, setCount] = useState(12345.67);

  return (
    <IntlProvider messages={messages[locale]} locale={locale}>
      <div style={{ padding: '20px', fontFamily: 'Arial' }}>
        <h1>
          <FormattedMessage id="greeting" />
        </h1>
        <p>
          <FormattedMessage id="description" />
        </p>
        
        <div style={{ marginBottom: '20px' }}>
          <button onClick={() => setLocale('zh')} style={{ marginRight: '10px' }}>
            中文
          </button>
          <button onClick={() => setLocale('en')}>
            English
          </button>
        </div>
        
        <p>
          <FormattedMessage id="count" />: 
          <FormattedNumber value={count} style="currency" currency="USD" />
        </p>
        
        <button onClick={() => setCount(c => c + 100)}>
          +100
        </button>
      </div>
    </IntlProvider>
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
