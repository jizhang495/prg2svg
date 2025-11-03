# PRG to SVG Viewer

A web application for visualizing aerosol jet printing (AJP) program files (.prg format) as SVG graphics.

## Features

- **Live Code Editor**: Monaco-based editor with syntax highlighting for editing PRG files
- **Real-time Visualization**: Renders PRG machine commands as SVG graphics
- **AI Assistant**: Chat with Claude to modify your PRG code
  - Ask in natural language to modify, add, or remove parts
  - AI automatically updates the code editor with changes
  - Understands PRG file format and printing concepts
- **Shutter State Visualization**:
  - Solid blue lines show active printing (shutter ON)
  - Solid red lines show rapid positioning moves (shutter OFF)
- **Interactive Zoom & Pan**:
  - Mouse wheel to zoom in/out
  - Click and drag to pan around the canvas
  - Reset button to return to default view
- **Adjustable Line Thickness**: Slider control to change line width (0.001 to 1.0)
- **Export SVG**: Save rendered graphics as SVG file
- **File Upload**: Load existing .prg files from your computer
- **Three-Column Layout**: Editor, preview, and AI assistant

## Getting Started

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file in the root directory with your Anthropic API key:

```
ANTHROPIC_API_KEY=your_api_key_here
```

### Development

#### Quick Start (Recommended)

Start the application using the provided script:

```bash
./start.sh
```

Stop the application:

```bash
./stop.sh
```

#### Manual Start

Alternatively, start both servers manually:

```bash
npm run dev
```

This will start:
- Frontend at `http://localhost:5173/`
- Backend API at `http://localhost:3001/`

View logs:
```bash
tail -f prg2svg.log
```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage

1. **Edit Code**: Type or paste PRG code in the left editor panel
2. **Load File**: Click "Load File" to upload a .prg file from your computer
3. **Ask AI**: Use the AI assistant (right panel) to modify your code:
   - "Delete some parts to make one rectangle instead of four"
   - "Add a circle in the center"
   - "Make all shapes twice as large"
   - AI will automatically update the code editor
4. **Adjust Line Width**: Use the slider to set desired line thickness (default: 0.05, range: 0.001 to 1.0)
5. **Render**: Click "Render" to visualize the PRG commands as SVG
6. **Interact**:
   - Scroll mouse wheel to zoom in/out
   - Click and drag to pan around
   - Click "Reset" to restore default view
7. **Export**: Click "Save SVG" to download the rendered graphics

## PRG File Format

The application parses the following PRG commands:

- `ptp/ev (X,Y),x,y,speed` - Point-to-point rapid move
- `line (X,Y),x,y` - Linear motion
- `arc2 (X,Y),x,y,angle` - Arc motion
- `MSEG (X,Y),x,y` - Begin motion segment
- `ENDS (X,Y)` - End motion segment
- `ShutterOpen` - Start material deposition
- `ShutterClose` - Stop material deposition

Lines starting with `!` are comments and are ignored.

## Example Files

Example PRG files for a 7-layer electrochemical actuator structure can be found in the `AutoCAD/Nafion thickness varied/` directory (data from https://doi.org/10.1039/D4SM00886C)

## Tech Stack

**Frontend:**
- **Vite**: Build tool and dev server
- **React**: UI framework
- **TypeScript**: Type safety
- **Monaco Editor**: Code editor component
- **Custom Parser**: PRG file parsing
- **SVG**: Graphics rendering

**Backend:**
- **Express**: API server
- **Anthropic Claude API**: AI assistant
- **Node.js**: Runtime environment

## Project Structure

```
src/
├── types/          # TypeScript type definitions
├── parser/         # PRG file parser
├── renderer/       # SVG rendering engine
├── components/     # React components (future)
├── App.tsx         # Main application component
└── main.tsx        # Application entry point
```

## Future Enhancements

- Support for loops and conditional statements
- Layer-by-layer visualization
- Animation of printing sequence
- Keyboard shortcuts for common operations
- Dark mode support
