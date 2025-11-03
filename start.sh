#!/bin/bash

# PRG to SVG - Start Script

echo "🚀 Starting PRG to SVG application..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Please create a .env file with your ANTHROPIC_API_KEY"
    echo "Example:"
    echo "ANTHROPIC_API_KEY=your_api_key_here"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the application
echo "🌐 Starting frontend (http://localhost:5173) and backend (http://localhost:3001)..."
nohup npm run dev > prg2svg.log 2>&1 &

# Save PID
echo $! > prg2svg.pid

# Wait a bit for servers to start
sleep 3

# Check if process is still running
if ps -p $(cat prg2svg.pid) > /dev/null 2>&1; then
    echo "✅ Application started successfully!"
    echo "   Frontend: http://localhost:5173"
    echo "   Backend:  http://localhost:3001"
    echo "   Logs:     tail -f prg2svg.log"
    echo ""
    echo "To stop: ./stop.sh"
else
    echo "❌ Failed to start application. Check prg2svg.log for details."
    cat prg2svg.log
    rm -f prg2svg.pid
    exit 1
fi
