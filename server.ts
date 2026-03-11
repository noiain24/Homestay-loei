import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const N8N_WEBHOOK_URL = "https://explanate-lyn-crawliest.ngrok-free.dev/webhook/2f836987-8101-4022-8ac6-4efb6ab0281d";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Proxy endpoint for n8n to avoid CORS issues
  app.post("/api/booking", async (req, res) => {
    console.log("Proxying booking request to n8n...");
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });

      if (response.ok) {
        const data = await response.text();
        res.status(200).send(data);
      } else {
        const errorText = await response.text();
        console.error("n8n error response:", errorText);
        // Send back the specific error from n8n to help the user debug
        res.status(response.status).json({ 
          error: "n8n Webhook Error", 
          details: errorText,
          suggestion: "Please check if your n8n Webhook node is set to POST method and the workflow is Active."
        });
      }
    } catch (error) {
      console.error("Fetch error to n8n:", error);
      res.status(500).json({ error: "Failed to connect to n8n webhook" });
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
