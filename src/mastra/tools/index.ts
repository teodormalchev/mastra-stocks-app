import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import axios from "axios";

if (typeof window === 'undefined') {
  require('dotenv').config();
}

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || "demo";

export const stockTool = createTool({
  id: "stock-price-tool",
  description: "Fetch current stock price information",
  inputSchema: z.object({
    symbol: z.string().describe("Stock ticker symbol (e.g., AAPL, MSFT)"),
    function: z.enum([
      "GLOBAL_QUOTE", 
      "TIME_SERIES_DAILY",
      "TIME_SERIES_WEEKLY",
      "TIME_SERIES_MONTHLY"
    ]).default("GLOBAL_QUOTE").describe("The data function to fetch"),
  }),
  outputSchema: z.object({
    symbol: z.string(),
    data: z.any(),
    lastRefreshed: z.string().optional(),
    message: z.string().optional(),
  }),
  execute: async ({ context }) => {
    // Extract parameters from the context object
    const symbol = context.symbol;
    const dataFunction = context.function;
    try {
      const response = await axios.get("https://www.alphavantage.co/query", {
        params: {
          function: dataFunction,
          symbol,
          apikey: API_KEY,
        },
      });

      // Handle API errors or rate limiting
      if (response.data?.Note) {
        return {
          symbol,
          data: null,
          message: response.data.Note,
        };
      }

      if (response.data?.["Error Message"]) {
        return {
          symbol,
          data: null,
          message: response.data["Error Message"],
        };
      }

      // Process data based on the function
      if (dataFunction === "GLOBAL_QUOTE") {
        return {
          symbol,
          data: response.data["Global Quote"],
          lastRefreshed: response.data["Global Quote"]?.["07. latest trading day"],
        };
      } else {
        // Handle time series data
        const metadataKey = "Meta Data";
        const timeSeriesKey = Object.keys(response.data).find(key => 
          key.includes("Time Series")
        );
        
        return {
          symbol,
          data: response.data[timeSeriesKey || ""],
          lastRefreshed: response.data[metadataKey]?.["3. Last Refreshed"],
        };
      }
    } catch (error) {
      console.error("Error fetching stock data:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        symbol,
        data: null,
        message: `Error fetching stock data: ${errorMessage}`,
      };
    }
  },
});