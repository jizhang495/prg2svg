# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

prg2svg is a web application for visualizing aerosol jet printing (AJP) program files (.prg format) as SVG graphics. The .prg files contain machine instructions for printing multilayer electrochemical actuator structures (7-layer: Nafion, Au, PEDOT:PSS, Nafion, PEDOT:PSS, Au, Nafion).

## Tech Stack

Frontend-only web application:
- **Monaco Editor**: Left panel for editable .prg code
- **SVG Renderer**: Right panel for geometry visualization
- **Vite + TypeScript**: Build system and development server
- **No backend required**: Pure client-side parsing and rendering

## PRG File Format

PRG files contain motion control commands for aerosol jet printing. Key concepts:

### Coordinate System
- Uses X,Y coordinate pairs in units (resolution: 1 count per unit)
- Commands operate in 2D plane

### Movement Commands
- `ptp/ev (X,Y),x,y,speed` - Point-to-point move with event (rapid positioning)
- `ptp/e (X,Y),x,y` - Point-to-point move with event
- `line (X,Y),x,y` - Linear motion to coordinates
- `arc2 (X,Y),x,y,angle` - Arc motion to coordinates with angle

### Path Control
- `MSEG (X,Y),x,y` - Begin motion segment at coordinates
- `ENDS (X,Y)` - End motion segment

### Shutter Control (Material Deposition)
- `Start gIntSubBuffer,ShutterOpen` - Start material deposition
- `Start gIntSubBuffer,ShutterClose` - Stop material deposition
- `till (^X_AST.#MOVE) & (^Y_AST.#MOVE)` - Wait for motion complete
- `wait N` - Wait N time units

### Structure
1. Header comments with metadata (source file, axes, resolution)
2. Alignment/fiducial marker setup (If/End blocks)
3. Sequence of move-deposit-move cycles

## Implementation Approach

### Phase 1: Simple Version (MVP) ✅ COMPLETED
- Parse basic commands: `line`, `arc2`, `ptp`, `MSEG`, `ENDS`
- Ignore: loops, alignment code (`If`/`End` blocks), `wait` commands
- Visualization:
  - Solid lines when shutter is ON (between ShutterOpen and ShutterClose)
  - Dotted lines when shutter is OFF (rapid moves)

### Phase 2: Enhanced Features ✅ COMPLETED
- ✅ Interactive zoom (mouse wheel) and pan (drag)
- ✅ Adjustable line thickness with slider control
- ✅ Export rendered SVG

### Phase 3: Additional Enhancements ✅ COMPLETED
- ✅ Proper arc rendering using angle parameters and SVG arc commands

### Phase 4: AI Assistant ✅ COMPLETED
- ✅ Express backend server with Anthropic Claude API integration
- ✅ Chat UI component for natural language code modifications
- ✅ Automatic code updates in editor based on AI responses
- ✅ Context-aware AI that understands PRG file format

### Phase 5: Future Enhancements
- Support for loops and conditionals
- Layer-by-layer visualization
- Animation of printing sequence

## Parser Architecture

1. **Lexer**: Tokenize .prg text into commands with parameters
2. **Command Parser**: Extract coordinate pairs and command types
3. **State Machine**: Track shutter state (on/off) while processing commands
4. **Path Generator**: Convert commands to SVG path elements
5. **Renderer**: Mount SVG to DOM

## Key Parsing Rules

- Commands are case-insensitive
- Coordinates follow pattern: `(X,Y),x_value,y_value`
- Comments start with `!`
- Ignore: `#0`, variable assignments (`gDblRapidSpeed`, etc.)
- Arc angles are in radians

## Development Commands

1. **Install dependencies**: `npm install`
2. **Configure environment**: Create `.env` file with `ANTHROPIC_API_KEY`
3. **Run development servers**: `npm run dev` (runs both frontend and backend)
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
4. **Build for production**: `npm run build`

## File Structure

Implemented organization:
- `/src/parser/` - PRG file parsing logic (`prgParser.ts`)
- `/src/renderer/` - SVG generation from parsed commands (`svgRenderer.ts`)
- `/src/components/` - React/UI components (`ZoomableSVG.tsx`)
- `/src/types/` - TypeScript type definitions (`prg.ts`)
- `/src/App.tsx` - Main application with editor and viewer
- `/AutoCAD/` - Example .prg files (reference data)

## Key Components

### Frontend

**`prgParser.ts`**
Parses PRG text into structured commands with shutter states. Extracts coordinates, handles motion commands, and tracks shutter on/off state.

**`svgRenderer.ts`**
Converts parsed commands to SVG with configurable line thickness. Calculates bounding boxes, handles coordinate transforms (Y-axis flip), and generates path elements. Supports proper arc rendering using SVG arc commands.

**`ZoomableSVG.tsx`**
Interactive SVG viewer with zoom (mouse wheel) and pan (drag) capabilities. Maintains transform state and provides reset functionality.

**`AIChat.tsx`**
Chat interface for AI assistant. Sends user messages with current PRG code to backend, displays responses, and automatically extracts and applies code modifications from AI responses.

**`App.tsx`**
Main UI with three-column layout: Monaco editor (left), zoomable SVG viewer (center), and AI chat (right). Manages state for code, rendering, and AI interactions.

### Backend

**`server/index.js`**
Express server providing `/api/chat` endpoint. Integrates with Anthropic Claude API, sends PRG-aware system prompts, and handles streaming responses. Configured with CORS for local development.

## Important Notes

- The existing .prg files in `AutoCAD/Nafion thickness varied/` are reference examples
- Start with one simple .prg file as test case (e.g., `1-nafbot.prg`)
- PRG format has no official spec - infer structure from example files
- Coordinate system origin and units should be determined by examining sample files
