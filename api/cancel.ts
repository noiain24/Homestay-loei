import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, ngrok-skip-browser-warning'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const PROD_URL = "https://n8n.srv1515012.hstgr.cloud/webhook/cancle";
  
  console.log(`[Proxy] Forwarding cancel request to: ${PROD_URL}`);
  
  try {
    const response = await fetch(PROD_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Vercel-Proxy',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(req.body),
    });

    const status = response.status;
    const text = await response.text();
    
    console.log(`[Proxy] n8n responded with status ${status}`);
    
    try {
      const data = JSON.parse(text);
      return res.status(status).json(data);
    } catch (e) {
      return res.status(status).send(text);
    }
  } catch (error: any) {
    console.error(`[Proxy] Error:`, error.message);
    return res.status(500).json({ error: 'Proxy error', details: error.message });
  }
}
