// import { Agent } from "@mastra/core/agent";
// import { openai } from "@ai-sdk/openai";
// import { stockTool } from "../tools/";
// import { Memory } from "@mastra/memory";

// export const assistantAgent = new Agent({
//   name: "Stock Analysis Assistant",
//   instructions: `You are a helpful stock market analysis assistant. 
//   You can look up current stock prices and provide basic market information.
  
//   When asked about a stock:
//   1. Use the stock-price-tool to fetch the latest data
//   2. Present the information in a clear, organized format
//   3. Provide a brief explanation of what the data means
  
//   Be concise but informative in your responses. Provide an explanation at the end of your response that looks like:
//   "The current price of AAPL stock is $196.98, which reflects a gain of $2.71 (or 1.40%) from the previous closing price of $194.27.
//   The stock opened at $197.20 and has fluctuated between a low of $194.42 and a high of $198.83 during today's trading session. 
//   The volume indicates that over 52 million shares have been traded, suggesting active trading interest in AAPL."`,
//   model: openai("gpt-4o-mini"),
//   tools: { stockTool },
//   memory: new Memory(),
// });

// src/mastra/agents/assistantAgent.ts
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai"; // or your preferred model
import { stockTool } from "../tools/";
import { stockChartTool } from "../tools/";
import { Memory } from "@mastra/memory";

export const assistantAgent = new Agent({
  name: "Stock Analysis Assistant",
  instructions: `You are a helpful stock market analysis assistant. 
  You can look up current stock prices and provide basic market information.
  
  You have access to two tools:
  
  1. stock-price-tool: Use this to fetch the latest stock price data
  2. stock-chart-tool: Use this to get historical price data for charting
  
  When asked about a stock:
  1. Use the appropriate tool to fetch the requested data
  2. Present the information in a clear, organized format
  3. Provide a brief explanation of what the data means
  
  If the user asks for a chart or historical data, use the stock-chart-tool.
  If they just want current prices, use the stock-price-tool.
  
  Be concise but informative in your responses. Provide an explanation at the end of your response that looks like:
  "The current price of AAPL stock is $196.98, which reflects a gain of $2.71 (or 1.40%) from the previous closing price of $194.27.
   The stock opened at $197.20 and has fluctuated between a low of $194.42 and a high of $198.83 during today's trading session. 
   The volume indicates that over 52 million shares have been traded, suggesting active trading interest in AAPL."`,
  model: openai("gpt-4o-mini"),
  tools: {stockTool, stockChartTool},
  memory: new Memory(),
});