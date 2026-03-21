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
    const PROD_URL = "https://n8n.srv1515012.hstgr.cloud/webhook/booking_log";
    const TEST_URL = "https://n8n.srv1515012.hstgr.cloud/webhook-test/booking_log";
    
    console.log(`[${new Date().toISOString()}] Proxying booking request to n8n...`);
    
    const tryFetch = async (url: string) => {
      try {
        const form = new FormData();
        Object.keys(req.body).forEach(key => form.append(key, req.body[key]));
        if (req.file) {
          form.append('slip', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
          });
        }

        console.log(`[${new Date().toISOString()}] Attempting booking fetch to: ${url}`);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout for file uploads

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            ...form.getHeaders(),
          },
          body: form.getBuffer(),
          signal: controller.signal
        });
        clearTimeout(timeout);
        return response;
      } catch (e: any) {
        console.error(`[${new Date().toISOString()}] Booking fetch error for ${url}:`, e.message);
        return null;
      }
    };

    // Try PROD URL first as requested by user for production use
    let response = await tryFetch(PROD_URL);
    if (!response || response.status === 404) {
      console.log("PROD URL failed or 404, trying TEST URL as fallback...");
      response = await tryFetch(TEST_URL);
    }

    if (response && response.ok) {
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        res.status(200).json(data);
      } catch (e) {
        res.status(200).send(text);
      }
    } else if (response) {
      const errorText = await response.text();
      console.error(`n8n booking error (${response.status}):`, errorText);
      res.status(response.status).json({ 
        error: "n8n Webhook Error", 
        status: response.status,
        details: errorText 
      });
    } else {
      res.status(503).json({ 
        error: "Service Unavailable", 
        details: "ไม่สามารถเชื่อมต่อกับระบบ n8n ได้ กรุณาติดต่อทาง LINE" 
      });
    }
  });

  // Proxy endpoint for checkphone
  app.post("/api/checkphone", async (req, res) => {
    const TEST_URL = "https://n8n.srv1515012.hstgr.cloud/webhook-test/checkphone";
    const PROD_URL = "https://n8n.srv1515012.hstgr.cloud/webhook/checkphone";
    
    console.log(`[${new Date().toISOString()}] Proxying checkphone request to n8n...`);
    
    const tryFetch = async (url: string) => {
      try {
        console.log(`[${new Date().toISOString()}] Attempting checkphone fetch to: ${url}`);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify(req.body),
          signal: controller.signal
        });
        clearTimeout(timeout);
        return response;
      } catch (e: any) {
        console.error(`[${new Date().toISOString()}] Checkphone fetch error for ${url}:`, e.message);
        return null;
      }
    };

    let response = await tryFetch(TEST_URL);
    if (!response || response.status === 404) {
      response = await tryFetch(PROD_URL);
    }

    if (response && response.ok) {
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        res.status(200).json(data);
      } catch (e) {
        res.status(200).send(text);
      }
    } else if (response) {
      const errorText = await response.text();
      res.status(response.status).json({ 
        error: "n8n CheckPhone Error", 
        status: response.status,
        details: errorText 
      });
    } else {
      res.status(503).json({ 
        error: "Service Unavailable", 
        details: "ระบบตรวจสอบขัดข้อง กรุณาติดต่อทาง LINE" 
      });
    }
  });

  // Proxy endpoint for cancel
  app.post("/api/cancel", async (req, res) => {
    const TEST_URL = "https://n8n.srv1515012.hstgr.cloud/webhook-test/cancle";
    const PROD_URL = "https://n8n.srv1515012.hstgr.cloud/webhook/cancle";
    
    console.log(`[${new Date().toISOString()}] Proxying cancel request to n8n...`);
    
    const tryFetch = async (url: string) => {
      try {
        console.log(`[${new Date().toISOString()}] Attempting cancel fetch to: ${url}`);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify(req.body),
          signal: controller.signal
        });
        clearTimeout(timeout);
        return response;
      } catch (e: any) {
        console.error(`[${new Date().toISOString()}] Cancel fetch error for ${url}:`, e.message);
        return null;
      }
    };

    let response = await tryFetch(TEST_URL);
    if (!response || response.status === 404) {
      response = await tryFetch(PROD_URL);
    }

    if (response && response.ok) {
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        res.status(200).json(data);
      } catch (e) {
        res.status(200).send(text);
      }
    } else if (response) {
      const errorText = await response.text();
      res.status(response.status).json({ 
        error: "n8n Cancel Error", 
        status: response.status,
        details: errorText 
      });
    } else {
      res.status(503).json({ 
        error: "Service Unavailable", 
        details: "ระบบยกเลิกขัดข้อง กรุณาติดต่อทาง LINE" 
      });
    }
  });

  // Proxy endpoint for GAS room status
  app.get("/api/gas-room-status", async (req, res) => {
    const GAS_URL = "https://script.google.com/macros/s/AKfycbxkwUBjmR1W9e51sV9DqOcK7N-jLXLdWpZM4f8kQemwQxHgPoWTli2dwrYuezHSAhtp/exec";
    
    console.log(`[${new Date().toISOString()}] Proxying room status request to GAS: ${GAS_URL}`);
    
    try {
      const response = await fetch(GAS_URL, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
        },
        redirect: 'follow'
      });
      
      console.log(`[${new Date().toISOString()}] GAS response status: ${response.status}`);
      
      if (response.ok) {
        const text = await response.text();
        console.log(`[${new Date().toISOString()}] GAS response length: ${text.length}`);
        try {
          const data = JSON.parse(text);
          res.status(200).json(data);
        } catch (e) {
          console.warn(`[${new Date().toISOString()}] GAS response is not JSON, sending as text`);
          res.status(200).send(text);
        }
      } else {
        const errorText = await response.text();
        console.error(`[${new Date().toISOString()}] GAS error response: ${errorText}`);
        res.status(response.status).send(errorText);
      }
    } catch (e) {
      console.error(`[${new Date().toISOString()}] GAS fetch error:`, e);
      res.status(500).json({ error: "Failed to connect to GAS room status", details: e instanceof Error ? e.message : String(e) });
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
