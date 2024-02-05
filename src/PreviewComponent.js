// PreviewComponent.js
import React from 'react';

const PreviewComponent = ({ content }) => {
  return (
    <div className="preview-wrapper">
      <h3>Preview</h3>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default PreviewComponent;
