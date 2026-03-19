import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import FormData from "form-data";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Proxy endpoint for n8n booking to avoid CORS issues
  app.post("/api/booking", upload.single('slip'), async (req: any, res) => {
    const PROD_URL = "https://explanate-lyn-crawliest.ngrok-free.dev/webhook/booking_log";
    const TEST_URL = "https://explanate-lyn-crawliest.ngrok-free.dev/webhook-test/booking_log";
    
    console.log("Proxying booking request with FormData to n8n...");
    
    const tryFetch = async (url: string) => {
      try {
        console.log(`Attempting booking fetch to: ${url}`);
        const form = new FormData();
        Object.keys(req.body).forEach(key => form.append(key, req.body[key]));
        if (req.file) {
          form.append('slip', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
          });
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            ...form.getHeaders(),
          },
          body: form.getBuffer(),
        });
        return response;
      } catch (e) {
        console.error(`Fetch error for ${url}:`, e);
        return null;
      }
    };

    let response = await tryFetch(PROD_URL);
    if (!response || response.status === 404) {
      response = await tryFetch(TEST_URL);
    }

    if (response && response.ok) {
      const text = await response.text();
      if (!text || text.trim() === "") {
        console.warn("n8n booking returned an empty response");
        return res.status(200).json({ status: "success", message: "Booking received by n8n (empty response)" });
      }
      
      try {
        const data = JSON.parse(text);
        res.status(200).json(data);
      } catch (e) {
        res.status(200).send(text);
      }
    } else if (response) {
      const errorText = await response.text();
      console.error("n8n booking error response:", errorText);
      res.status(response.status).json({ error: "n8n Webhook Error", details: errorText });
    } else {
      res.status(500).json({ error: "Failed to connect to n8n booking webhook" });
    }
  });

  // Proxy endpoint for checkphone
  app.post("/api/checkphone", async (req, res) => {
    const PROD_URL = "https://explanate-lyn-crawliest.ngrok-free.dev/webhook/checkphone";
    const TEST_URL = "https://explanate-lyn-crawliest.ngrok-free.dev/webhook-test/checkphone";
    
    console.log("Proxying checkphone request to n8n...");
    
    const tryFetch = async (url: string) => {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify(req.body),
        });
        return response;
      } catch (e) {
        return null;
      }
    };

    let response = await tryFetch(PROD_URL);
    if (!response || response.status === 404) {
      response = await tryFetch(TEST_URL);
    }

    if (response && response.ok) {
      const text = await response.text();
      if (!text || text.trim() === "") {
        console.warn("n8n checkphone returned an empty response");
        return res.status(200).json({ error: "No data found", details: "Empty response from n8n" });
      }
      
      try {
        const data = JSON.parse(text);
        res.status(200).json(data);
      } catch (e) {
        res.status(200).send(text);
      }
    } else if (response) {
      const errorText = await response.text();
      console.error("n8n checkphone error response:", errorText);
      res.status(response.status).send(errorText);
    } else {
      res.status(500).json({ error: "Failed to connect to n8n checkphone webhook" });
    }
  });

  // Proxy endpoint for cancel
  app.post("/api/cancel", async (req, res) => {
    const PROD_URL = "https://explanate-lyn-crawliest.ngrok-free.dev/webhook/cancle";
    const TEST_URL = "https://explanate-lyn-crawliest.ngrok-free.dev/webhook-test/cancle";
    
    console.log("Proxying cancel request to n8n...");
    
    const tryFetch = async (url: string) => {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify(req.body),
        });
        return response;
      } catch (e) {
        return null;
      }
    };

    let response = await tryFetch(PROD_URL);
    if (!response || response.status === 404) {
      response = await tryFetch(TEST_URL);
    }

    if (response && response.ok) {
      const text = await response.text();
      if (!text || text.trim() === "") {
        console.warn("n8n cancel returned an empty response");
        return res.status(200).json({ status: "success", message: "Cancel request received by n8n" });
      }
      
      try {
        const data = JSON.parse(text);
        res.status(200).json(data);
      } catch (e) {
        res.status(200).send(text);
      }
    } else if (response) {
      const errorText = await response.text();
      console.error("n8n cancel error response:", errorText);
      res.status(response.status).send(errorText);
    } else {
      res.status(500).json({ error: "Failed to connect to n8n cancel webhook" });
    }
  });

  // Proxy endpoint for GAS room status
  app.get("/api/gas-room-status", async (req, res) => {
    const GAS_URL = "https://script.google.com/macros/s/AKfycbxkwUBjmR1W9e51sV9DqOcK7N-jLXLdWpZM4f8kQemwQxHgPoWTli2dwrYuezHSAhtp/exec";
    
    console.log("Proxying room status request to GAS...");
    
    try {
      const response = await fetch(GAS_URL, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          res.status(200).json(data);
        } catch (e) {
          res.status(200).send(text);
        }
      } else {
        const errorText = await response.text();
        res.status(response.status).send(errorText);
      }
    } catch (e) {
      console.error("GAS fetch error:", e);
      res.status(500).json({ error: "Failed to connect to GAS room status" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
