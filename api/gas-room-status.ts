import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const GAS_URL = "https://script.google.com/macros/s/AKfycbxkwUBjmR1W9e51sV9DqOcK7N-jLXLdWpZM4f8kQemwQxHgPoWTli2dwrYuezHSAhtp/exec";
  
  console.log(`[Proxy] Forwarding room status request to: ${GAS_URL}`);
  
  try {
    const response = await fetch(GAS_URL, {
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
      },
      redirect: 'follow'
    });

    const status = response.status;
    const text = await response.text();
    
    console.log(`[Proxy] GAS responded with status ${status}`);
    
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
