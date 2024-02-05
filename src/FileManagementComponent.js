import React, { useState, useRef, useEffect } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/theme-monokai';
import { IoMdAdd } from 'react-icons/io';
import { MdOutlineArrowDropDown, MdOutlineArrowDropUp } from 'react-icons/md';  // Import DropUp icon for toggle
import { RxCross1 } from 'react-icons/rx';
import ResizeObserver from 'resize-observer-polyfill';  // Add the polyfill for ResizeObserver
import './File.css';
import "ace-builds/src-noconflict/worker-json";
import "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";
import 'ace-builds/src-noconflict/worker-html';
import { GiHamburgerMenu } from "react-icons/gi";
import { BiShow } from "react-icons/bi";
import { BiHide } from "react-icons/bi";
import Question from './Question';

export const PreviewComponent = ({ content, onAnchorClick, activeFileName }) => {
  const handleAnchorClick = (event) => {
    const clickedLink = event.target.closest('a');
    if (clickedLink && clickedLink.href) {
      event.preventDefault();
      const linkedFileName = clickedLink.href.split('/').pop();
      onAnchorClick(linkedFileName);

      // Updates address bar
      const browserAddress = document.querySelector('.browser-address');
      if (browserAddress) {
        browserAddress.textContent = `localhost/${linkedFileName}`;
      }
    }
  };


  return (
    <div>
      <div className="browser-bar">
        <span className="browser-address">localhost/{activeFileName}</span>
      </div>
      <div className="preview-wrapper" onClick={handleAnchorClick}>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
};

const FileEditor = ({ file, activeFileId, onFileChange, onSwitchFile, onRun }) => {
  console.log(file);
  return (
    <div
      className={`editor-container ${file.id === activeFileId ? 'active-editor' : 'inactive-editor'}`}
      style={{ display: file.id === activeFileId ? 'block' : 'none' }}
    >
      <h3>{file.name}</h3>
      <AceEditor
        mode={file.mode}
        theme="monokai"
        name={`editor-${file.id}`}
        editorProps={{ $blockScrolling: true }}
        value={file.content}
        fontSize={15}
        onChange={(newContent) => {
          onFileChange(file.id, newContent);
        }}
        style={{ width: '100%', height: '80vh' }}
      />
      <div className='run_buton'>
      <button onClick={() => onRun(file.content)} className="run-button button">
        Go Live
      </button></div>
    </div>
  );
};

const FileManagementComponent = () => {
  const [width, setWidth] = useState(window.innerWidth);
  const [questionVisible, setQuestionVisible] = useState(true);
  const [previewVisible, setPreviewVisible] = useState(true);
  const [activeFileName, setActiveFileName] = useState('');
  const [files, setFiles] = useState([
    { id: 1, name: 'index.html', content: '<p>type here</p>', mode: 'html' },
  ]);
  const [activeFileId, setActiveFileId] = useState(1);
  const [newFileName, setNewFileName] = useState('');
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const containerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [showHideQuestionIcon, setShowHideQuestionIcon] = useState(true);
  const [showHidePreviewIcon, setShowHidePreviewIcon] = useState(true);


  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      setWidth(entries[0].contentRect.width);
    });

    resizeObserver.observe(document.body);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const newActiveFileName = files.find(file => file.id === activeFileId)?.name;
    setActiveFileName(newActiveFileName);
  }, [activeFileId, files]);

  const toggleQuestion = () => {
    setQuestionVisible(!questionVisible);
    setShowHideQuestionIcon(!showHideQuestionIcon);
  };

  const togglePreview = () => {
    setPreviewVisible(!previewVisible);
    setShowHidePreviewIcon(!showHidePreviewIcon);
  };
  const getFileMode = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'js':
        return 'javascript';
      default:
        return 'text';
    }
  };

  const addFile = () => {
    const newFile = {
      id: files.length + 1,
      name: newFileName,
      content: '',
      mode: getFileMode(newFileName),
    };
    setFiles([...files, newFile]);
    setNewFileName('');
    setIsAddingFile(false);
  };

  const switchFile = (id) => {
    setActiveFileId(id);
  };

  const handleAnchorClick = (linkedFileName) => {
    const linkedFile = files.find((file) => file.name === linkedFileName);
    if (linkedFile) {
      setPreviewContent(linkedFile.content);
    } else {
      //file doesn't exist
    }
  };

  const handleFileChange = (id, newContent) => {
    const updatedFiles = files.map((f) =>
      f.id === id ? { ...f, content: newContent } : f
    );
    setFiles(updatedFiles);
  };

  const deleteFile = (id) => {
    const updatedFiles = files.filter((file) => file.id !== id);
    setFiles(updatedFiles);
    if (activeFileId === id) {
      setActiveFileId(updatedFiles.length > 0 ? updatedFiles[0].id : null);
    }
  };

  const handleRun = () => {
    const activeFile = files.find((file) => file.id === activeFileId);

    if (activeFile && activeFile.mode === 'html') {
      let htmlContent = activeFile.content;
      let cssContent = '';
      let jsContent = '';

      // Extracts CSS and JS references from HTML
      const cssMatches = activeFile.content.match(/<link\s+rel="stylesheet"\s+href="(.+?)"\s*\/?>/g);
      const jsMatches = activeFile.content.match(/<script\s+src="(.+?)"\s*><\/script>/g);

      // Loads the content of CSS and JS files if references exist
      if (cssMatches) {
        cssMatches.forEach((match) => {
          const hrefMatch = match.match(/href="(.+?)"/);
          if (hrefMatch && hrefMatch[1]) {
            const cssFile = files.find((f) => f.name === hrefMatch[1] && f.mode === 'css');
            if (cssFile) {
              cssContent += cssFile.content;
            }
          }
        });
      }

      if (jsMatches) {
        jsMatches.forEach((match) => {
          const srcMatch = match.match(/src="(.+?)"/);
          if (srcMatch && srcMatch[1]) {
            const jsFile = files.find((f) => f.name === srcMatch[1] && f.mode === 'javascript');
            if (jsFile) {
              jsContent += jsFile.content;
            }
          }
        });
      }

      const combinedContent = `
        <html>
          <head>
            <style>${cssContent}</style>
          </head>
          <body>
            ${htmlContent}
            <script>${jsContent}</script>
          </body>
        </html>
      `;

      setPreviewContent(combinedContent);
    }
  };

  const handleButtonClick = () => {
    setOpen(!open);
  };

  const handleButtonClick1 = () => {
    setOpen1(!open1);
  };

  return (
    <div className={`file-management ${open1 ? 'sidebar-open1' : ''}`}>

<div className={`sidebar ${open1 ? 'open1' : ''}`}>
        <p className="button1 is-primary" onClick={toggleQuestion}>
          <span className="text">
            {questionVisible ? 'Hide Question' : 'Show Question'}
          </span>
          <span className="icon">{showHideQuestionIcon ? <BiShow color="black" size="20px" /> : <BiHide color="black" size="20px" />}</span>
        </p>
        <p className="button1 is-primary" onClick={togglePreview}>
          <span className="text">
            {previewVisible ? 'Hide Preview' : 'Show Preview'}
          </span>
          <span className="icon">{showHidePreviewIcon ? <BiShow color="black" size="20px" /> : <BiHide color="black" size="20px" />}</span>
        </p>
        <div className="container" ref={containerRef}>
        <p className="create-file-button" onClick={handleButtonClick}>
            Files{open ? <MdOutlineArrowDropUp color="black" size="30px" /> : <MdOutlineArrowDropDown color="black" size="30px" />}
          </p>
          {open && (
            <div className="drop-down">
              <ul>
                <li>
                  <div className="file-actions">
                    {!isAddingFile ? (
                      <p onClick={() => setIsAddingFile(true)} className="create-file-button">
                        Add File <IoMdAdd color="black" size="20px" />
                      </p>

                    ) : (
                      <>
                       <div className='button1'> <input
                          type="text"
                          value={newFileName}
                          onChange={(e) => setNewFileName(e.target.value)}
                          placeholder="Enter file name"
                          className="file-name-input"
                        />
                     
                       <button onClick={addFile} className="add-file-confirm-button">
                          Create
                        </button>  </div>
                      </>
                    )}
                  </div>
                </li>
                <div className="file-list">
                  {files.map((file) => (
                    <li key={file.id}>
                      <div className="file-item">
                        <button onClick={() => switchFile(file.id)} className="switch-file-button">
                          Switch to {file.name}
                        </button>
                        <button onClick={() => deleteFile(file.id)} className="delete-file-button">
                            <RxCross1 />
                          </button>



                      </div>
                    </li>
                  ))}
                </div>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className='ham'>
        <div>
          <GiHamburgerMenu className="sidebar-toggle" onClick={handleButtonClick1} size="25px" color='white'  /></div>
      </div><br></br><br></br><br></br>
      <div className="columns">
        <div className={`column is-3 ${questionVisible ? '' : 'is-hidden'}`}>
          <div className='box'>
            <Question />
          </div>
        </div>
        <div className={`column is-6 ${questionVisible ? 'is-offset-3' : ''}`}><div className='box'>
          {files.map((file) => (
            <FileEditor
              key={file.id}
              file={file}
              activeFileId={activeFileId}
              onFileChange={handleFileChange}
              onSwitchFile={switchFile}
              onRun={handleRun}
            />
          ))}
        </div>
        </div>
        <div className={`column is-3 ${previewVisible ? '' : 'is-hidden'}`}><div className='box'>

          <PreviewComponent
            content={previewContent}
            onAnchorClick={handleAnchorClick}
            activeFileName={activeFileName}
          />

        </div></div>
      </div>

    </div>
  );
};

export default FileManagementComponent;
