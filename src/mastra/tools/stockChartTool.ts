// // src/mastra/tools/stockChartTool.ts
// import { createTool } from "@mastra/core/tools";
// import { z } from "zod";
// import axios from "axios";

// // Load environment variables in non-browser environments
// if (typeof window === 'undefined') {
//   require('dotenv').config();
// }

// const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || "demo";

// export const stockChartTool = createTool({
//   id: "stock-chart-tool",
//   description: "Generate stock price chart data for visualization",
//   inputSchema: z.object({
//     symbol: z.string().describe("Stock ticker symbol (e.g., AAPL, MSFT)"),
//     timeframe: z.enum(["daily", "weekly", "monthly"]).default("daily")
//       .describe("Timeframe for the chart data"),
//     limit: z.number().default(30).describe("Number of data points to return"),
//   }),
//   outputSchema: z.object({
//     symbol: z.string(),
//     timeframe: z.string(),
//     dates: z.array(z.string()),
//     prices: z.array(z.number()),
//     error: z.string().optional(),
//   }),
//   execute: async ({ symbol, timeframe, limit }) => {
//     const symbol = context.symbol;
//     const dataFunction = context.function;
//     try {
//       // Map timeframe to API function
//       const functionMap = {
//         daily: "TIME_SERIES_DAILY",
//         weekly: "TIME_SERIES_WEEKLY",
//         monthly: "TIME_SERIES_MONTHLY",
//       };
      
//       const apiFunction = functionMap[timeframe];
      
//       const response = await axios.get("https://www.alphavantage.co/query", {
//         params: {
//           function: apiFunction,
//           symbol,
//           apikey: API_KEY,
//         },
//       });

//       // Handle API errors or rate limiting
//       if (response.data?.Note) {
//         return {
//           symbol,
//           timeframe,
//           dates: [],
//           prices: [],
//           error: response.data.Note,
//         };
//       }

//       if (response.data?.["Error Message"]) {
//         return {
//           symbol,
//           timeframe,
//           dates: [],
//           prices: [],
//           error: response.data["Error Message"],
//         };
//       }

//       // Find the time series key
//       const timeSeriesKey = Object.keys(response.data).find(key => 
//         key.includes("Time Series")
//       );
      
//       if (!timeSeriesKey || !response.data[timeSeriesKey]) {
//         return {
//           symbol,
//           timeframe,
//           dates: [],
//           prices: [],
//           error: "No data found",
//         };
//       }
      
//       // Extract dates and closing prices
//       const timeSeries = response.data[timeSeriesKey];
//       const dates = Object.keys(timeSeries).slice(0, limit);
      
//       // Sort dates in ascending order
//       dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      
//       // Extract closing prices for each date
//       const prices = dates.map(date => {
//         // Different APIs use different field names for close price
//         const closePrice = 
//           timeSeries[date]["4. close"] || 
//           timeSeries[date]["close"] || 
//           "0";
        
//         return parseFloat(closePrice);
//       });
      
//       return {
//         symbol,
//         timeframe,
//         dates,
//         prices,
//         error: undefined,
//       };
//     } catch (error) {
//       console.error("Error fetching chart data:", error);
//       return {
//         symbol,
//         timeframe,
//         dates: [],
//         prices: [],
//         error: `Error fetching chart data: ${error.message}`,
//       };
//     }
//   },
// });