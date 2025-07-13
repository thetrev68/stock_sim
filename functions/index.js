/**
 * Firebase Cloud Functions for Stock Simulator
 * Provides CORS-enabled proxy for Tiingo API
 */

const {setGlobalOptions} = require("firebase-functions");
const functions = require("firebase-functions");
const cors = require("cors")({origin: true});

// Tiingo API proxy function
exports.getTiingoHistoricalData = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // Only allow GET requests
      if (req.method !== "GET") {
        return res.status(405).send("Method Not Allowed");
      }

      // Get parameters from query string
      const {ticker, startDate, endDate} = req.query;

      if (!ticker) {
        return res.status(400).send("Missing ticker parameter");
      }

      // Tiingo API key
      const tiingoApiKey = "5630214e66cda21e12a6a1bcee38baa31eee76f3";

      // Build Tiingo API URL
      const baseUrl = "https://api.tiingo.com/tiingo/daily";
      const tickerUpper = ticker.toUpperCase();
      const tiingoUrl = `${baseUrl}/${tickerUpper}/prices` +
        `?startDate=${startDate}&endDate=${endDate}&token=${tiingoApiKey}`;

      console.log(`Proxying request for ${ticker}: ${tiingoUrl}`);

      // Fetch from Tiingo API
      const fetch = require("node-fetch");
      const tiingoResponse = await fetch(tiingoUrl);

      if (!tiingoResponse.ok) {
        const errorMsg = `Tiingo API error: ${tiingoResponse.status}`;
        throw new Error(errorMsg);
      }

      const data = await tiingoResponse.json();

      // Return the data with CORS headers
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "GET");
      res.json(data);
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).json({error: "Internal server error"});
    }
  });
});

// Set global options for cost control
setGlobalOptions({maxInstances: 10});
