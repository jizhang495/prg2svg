#!/bin/bash

# PRG to SVG - Stop Script

echo "🛑 Stopping PRG to SVG application..."

# Kill process from PID file if it exists
if [ -f prg2svg.pid ]; then
    PID=$(cat prg2svg.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "Stopping main process (PID: $PID)..."
        kill $PID 2>/dev/null
    fi
    rm -f prg2svg.pid
fi

# Kill all related processes
echo "Stopping all related processes..."
pkill -f "npm run dev" 2>/dev/null
pkill -f "vite" 2>/dev/null
pkill -f "node server/index.js" 2>/dev/null
pkill -f "concurrently" 2>/dev/null

# Wait a moment
sleep 1

# Check if any processes are still running
REMAINING=$(ps aux | grep -E "(vite|npm run dev|node server)" | grep -v grep | wc -l)

if [ $REMAINING -eq 0 ]; then
    echo "✅ Application stopped successfully!"
else
    echo "⚠️  Some processes may still be running. Force killing..."
    pkill -9 -f "npm run dev" 2>/dev/null
    pkill -9 -f "vite" 2>/dev/null
    pkill -9 -f "node server/index.js" 2>/dev/null
    sleep 1
    echo "✅ Application stopped!"
fi

# Clean up log file if desired (optional)
# rm -f prg2svg.log

echo ""
echo "To restart: ./start.sh"
