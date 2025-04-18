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
    return await getStockData(context.symbol, context.function);
  },
});

type DataFunction = "GLOBAL_QUOTE" | "TIME_SERIES_DAILY" | "TIME_SERIES_WEEKLY" | "TIME_SERIES_MONTHLY";

interface StockDataResult {
    symbol: string;
    data: any | null;
    lastRefreshed?: string;
    message?: string;
  }

const getStockData = async(symbol: string, dataFunction: DataFunction): Promise<StockDataResult> => {
    try {
    const response = await axios.get("https://www.alphavantage.co/query", {
        params: {
        function: dataFunction,
        symbol,
        apikey: API_KEY,
        },
    });

    // Handling API errors
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

    // Processing data based on the function
    if (dataFunction === "GLOBAL_QUOTE") {
        return {
        symbol,
        data: response.data["Global Quote"],
        lastRefreshed: response.data["Global Quote"]?.["07. latest trading day"],
        };
    } else {
        // Time series data
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
}

export const stockChartTool = createTool({
    id: "stock-chart-tool",
    description: "Generate stock price chart data for visualization",
    inputSchema: z.object({
      symbol: z.string().describe("Stock ticker symbol (e.g., AAPL, MSFT)"),
      timeframe: z.enum(["daily", "weekly", "monthly"]).default("daily")
        .describe("Timeframe for the chart data"),
      limit: z.number().default(15).describe("Number of data points to return"),
    }),
    outputSchema: z.object({
      symbol: z.string(),
      timeframe: z.string(),
      dates: z.array(z.string()),
      prices: z.array(z.number()),
      error: z.string().optional(),
    }),
    execute: async ({ context }) => {
      const symbol = context.symbol;
      const timeframe = context.timeframe
      const limit = context.limit;
      try {
        // Mapping timeframe to the specific API function
        const functionMap = {
          daily: "TIME_SERIES_DAILY",
          weekly: "TIME_SERIES_WEEKLY",
          monthly: "TIME_SERIES_MONTHLY",
        };
        
        const apiFunction = functionMap[timeframe];
        
        const response = await axios.get("https://www.alphavantage.co/query", {
          params: {
            function: apiFunction,
            symbol,
            apikey: API_KEY,
          },
        });
  
        // Handling API errors
        if (response.data?.Note) {
          return {
            symbol,
            timeframe,
            dates: [],
            prices: [],
            error: response.data.Note,
          };
        }
  
        if (response.data?.["Error Message"]) {
          return {
            symbol,
            timeframe,
            dates: [],
            prices: [],
            error: response.data["Error Message"],
          };
        }
  
        // Getting the time series key of our response
        const timeSeriesKey = Object.keys(response.data).find(key => 
          key.includes("Time Series")
        );
        
        if (!timeSeriesKey || !response.data[timeSeriesKey]) {
          return {
            symbol,
            timeframe,
            dates: [],
            prices: [],
            error: "No data found",
          };
        }
        
        // Getting dates and closing prices
        const timeSeries = response.data[timeSeriesKey];
        const dates = Object.keys(timeSeries).slice(0, limit);
  
        dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        
        // Extract closing prices for each date
        const prices = dates.map(date => {
          const closePrice = 
            timeSeries[date]["4. close"] || 
            timeSeries[date]["close"] || 
            "0";
          
          return parseFloat(closePrice);
        });
        
        return {
          symbol,
          timeframe,
          dates,
          prices,
          error: undefined,
        };
      } catch (error) {
        console.error("Error fetching chart data:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          symbol,
          timeframe,
          dates: [],
          prices: [],
          error: `Error fetching chart data: ${errorMessage}`,
        };
      }
    },
  });