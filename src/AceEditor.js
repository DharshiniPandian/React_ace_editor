import React, { useState } from 'react';
import AceEditor from 'react-ace';
// import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/theme-monokai';
import "ace-builds/webpack-resolver";

const AceEditorComponent = ({ htmlCode, setHtmlCode }) => {
  const handleCodeChange = (newCode) => {
    setHtmlCode(newCode);
  };

  return (
    <div style={{ width: '100%', height: '100vh', float: 'left' }}>
      <AceEditor
        mode="html"
        theme="monokai"
        name="UNIQUE_ID_OF_DIV"
        editorProps={{ $blockScrolling: true }}
        value={htmlCode}
        onChange={handleCodeChange}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default AceEditorComponent;
