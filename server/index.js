import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'PRG to SVG API Server',
    endpoints: {
      'POST /api/chat': 'Chat with AI assistant'
    }
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, currentCode } = req.body;

    // Build system prompt with context about PRG format
    const systemPrompt = `You are an AI assistant helping users modify PRG (aerosol jet printing program) files.

PRG File Format:
- Lines starting with ! are comments
- Motion commands: line (X,Y),x,y  |  arc2 (X,Y),x,y,angle  |  ptp/ev (X,Y),x,y,speed
- Path control: MSEG (X,Y),x,y (begin segment)  |  ENDS (X,Y) (end segment)
- Shutter control: ShutterOpen (start printing)  |  ShutterClose (stop printing)

Current PRG Code:
\`\`\`
${currentCode}
\`\`\`

When the user asks you to modify the code:
1. Analyze their request carefully
2. Generate the COMPLETE modified PRG code
3. Wrap your code output in a code fence with "prg" language marker
4. Explain what you changed

Example response format:
I'll modify the code to [explanation]. Here's the updated PRG code:

\`\`\`prg
[complete modified code here]
\`\`\`

Changes made:
- [change 1]
- [change 2]`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8096,
      system: systemPrompt,
      messages: messages,
    });

    res.json({
      response: response.content[0].text
    });
  } catch (error) {
    console.error('Anthropic API error:', error);
    res.status(500).json({
      error: 'Failed to get response from AI',
      details: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
