import React from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/themes/prism-tomorrow.css';

interface CodeEditorProps {
  code: string;
  onCodeChange: (newCode: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onCodeChange }) => {
  return (
    <Editor
      value={code}
      onValueChange={onCodeChange}
      highlight={code => highlight(code, languages.jsx, 'jsx')}
      padding={10}
      style={{
        fontFamily: '"Fira Mono", "DejaVu Sans Mono", Menlo, Consolas, "Liberation Mono", Monaco, "Lucida Console", monospace',
        fontSize: 14,
        backgroundColor: '#2d2d2d',
        color: '#f8f8f2',
        borderRadius: '4px',
        flex: 1, // Allow editor to fill the pane
        overflowY: 'auto', // 当代码过长时显示垂直滚动条
      }}
      // The outer div in App.tsx now handles the pane layout.
      // We need to ensure the editor itself can grow.
      className="code-editor-wrapper" 
    />
  );
};

export default CodeEditor;
