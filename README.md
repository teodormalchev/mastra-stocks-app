# Stock Price Lookup with Mastra.ai

This app looks up current and historical stock prices using the Alpha Vantage API with the Mastra.ai framework.

## Features

- Look up current stock prices using a natural language interface
- Get daily, weekly, or monthly stock data
- Compare multiple stocks in a single query
- Get historical data that can be used for making charts

## Prerequisites

- Node.js v20.0+
- An API key from Alpha Vantage

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root with your Alpha Vantage API key:
   ```
   ALPHA_VANTAGE_API_KEY=YOUR_API_KEY_HERE
   ```

## Usage

Start the Mastra playground to interact with your agent:

```bash
npm run mastra dev
```

Once the playground is running, you can ask the agent questions like:
- "What's the current price of AAPL stock?"
- "Show me the weekly data for MSFT."
- "Compare the prices of AAPL, GOOG, and AMZN."
- "What was the price of GOOG for the last 10 days?"

## Project Structure

- `src/mastra/tools/index.ts`: Definition of the stock price lookup tool and historical data tool
- `src/mastra/agents/index.ts`: The AI agent that uses the two tools
- `src/mastra/index.ts`: Mastra entry point

## API Limits

Note that the free tier of Alpha Vantage limits you to 25 API requests per day. Consider upgrading to a paid plan for higher limits.
