import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { PRGParser } from './parser/prgParser';
import { SVGRenderer } from './renderer/svgRenderer';
import { ZoomableSVG } from './components/ZoomableSVG';
import { AIChat } from './components/AIChat';
import './App.css';

const defaultCode = `#0
! **********************************
! PRG to SVG Example
! **********************************

ptp/ev (X,Y),1.00000,1.00000,gDblRapidSpeed
Start gIntSubBuffer,ShutterOpen;TILL PST(gIntSubBuffer).#RUN = 0
wait 2
MSEG (X,Y),1.00000,1.00000
line (X,Y),1.00000,5.00000
line (X,Y),5.00000,5.00000
line (X,Y),5.00000,1.00000
line (X,Y),1.00000,1.00000
ENDS (X,Y)
till (^X_AST.#MOVE) & (^Y_AST.#MOVE)
Start gIntSubBuffer,ShutterClose;TILL PST(gIntSubBuffer).#RUN = 0
wait 2

ptp/ev (X,Y),2.00000,2.00000,gDblRapidSpeed
Start gIntSubBuffer,ShutterOpen;TILL PST(gIntSubBuffer).#RUN = 0
wait 2
MSEG (X,Y),2.00000,2.00000
line (X,Y),2.00000,4.00000
line (X,Y),4.00000,4.00000
line (X,Y),4.00000,2.00000
line (X,Y),2.00000,2.00000
ENDS (X,Y)
till (^X_AST.#MOVE) & (^Y_AST.#MOVE)
Start gIntSubBuffer,ShutterClose;TILL PST(gIntSubBuffer).#RUN = 0
wait 2

STOP
`;

function App() {
  const [code, setCode] = useState(defaultCode);
  const [svg, setSvg] = useState('');
  const [lineThickness, setLineThickness] = useState(0.05);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRender = () => {
    try {
      const parser = new PRGParser();
      const parsed = parser.parse(code);

      const renderer = new SVGRenderer();
      const svgOutput = renderer.render(parsed, {
        width: 800,
        height: 600,
        lineThickness
      });

      setSvg(svgOutput);
    } catch (error) {
      console.error('Error rendering PRG:', error);
      alert('Error rendering PRG file. Check console for details.');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCode(content);
      };
      reader.readAsText(file);
    }
  };

  const handleLoadFile = () => {
    fileInputRef.current?.click();
  };

  const handleSavePRG = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'program.prg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveSVG = () => {
    if (!svg) {
      alert('Please render the PRG file first.');
      return;
    }

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'prg-output.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>PRG to SVG Viewer</h1>
        <p>Visualize aerosol jet printing program files</p>
      </header>

      <div className="container">
        <div className="editor-panel">
          <div className="panel-header">
            <h2>PRG Code Editor</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="render-button secondary" onClick={handleLoadFile}>
                Load File
              </button>
              <button className="render-button secondary" onClick={handleSavePRG}>
                Save PRG
              </button>
              <button className="render-button" onClick={handleRender}>
                Render
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".prg"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>
          </div>
          <div className="editor-wrapper">
            <Editor
              height="100%"
              defaultLanguage="plaintext"
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-light"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'off',
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        <div className="viewer-panel">
          <div className="panel-header">
            <h2>SVG Preview</h2>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label htmlFor="thickness-slider" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Line Width:
                </label>
                <input
                  id="thickness-slider"
                  type="range"
                  min="0.001"
                  max="1"
                  step="0.001"
                  value={lineThickness}
                  onChange={(e) => setLineThickness(parseFloat(e.target.value))}
                  style={{ width: '120px' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b', minWidth: '3rem' }}>
                  {lineThickness.toFixed(3)}
                </span>
              </div>
              <button
                className="render-button secondary"
                onClick={handleSaveSVG}
                disabled={!svg}
                style={{ opacity: svg ? 1 : 0.5, cursor: svg ? 'pointer' : 'not-allowed' }}
              >
                Save SVG
              </button>
            </div>
          </div>
          <div className="svg-viewer">
            {svg ? (
              <ZoomableSVG svgContent={svg} />
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📐</div>
                <p>Click "Render" to visualize your PRG file</p>
                <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#94a3b8' }}>
                  Use mouse wheel to zoom, drag to pan
                </p>
              </div>
            )}
          </div>
          <div className="legend">
            <div className="legend-item">
              <div className="legend-line printing"></div>
              <span>Printing (shutter ON)</span>
            </div>
            <div className="legend-item">
              <div className="legend-line rapid"></div>
              <span>Rapid move (shutter OFF)</span>
            </div>
          </div>
        </div>

        <div className="chat-panel">
          <AIChat currentCode={code} onCodeUpdate={setCode} />
        </div>
      </div>
    </div>
  );
}

export default App;
