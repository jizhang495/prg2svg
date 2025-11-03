import { useRef, useState, useEffect, WheelEvent, MouseEvent } from 'react';

interface ZoomableSVGProps {
  svgContent: string;
}

export function ZoomableSVG({ svgContent }: ZoomableSVGProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset zoom and pan when SVG content changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [svgContent]);

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();

    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.1, scale + delta), 10);

    setScale(newScale);
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '0.5rem',
          borderRadius: '0.375rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          fontSize: '0.75rem',
          color: '#64748b',
        }}
      >
        <div>Zoom: {(scale * 100).toFixed(0)}%</div>
        <button
          onClick={handleReset}
          style={{
            padding: '0.25rem 0.5rem',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            fontSize: '0.75rem',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
