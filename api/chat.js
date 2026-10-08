export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  
  if (!API_KEY) {
    return res.status(500).json({ error: 'API key is missing on the server' });
  }

  const message = req.body?.message;
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: { message: 'Message is required' } });
  }
  if (message.length > 2000) {
    return res.status(413).json({ error: { message: 'Message is too long' } });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{
            text: "Сен Қызғалдақ (тюльпан) туралы сарапшысың. Қазақ тілінде қысқа, түсінікті әрі сыпайы жауап бер. Тек қана қызғалдақтар, олардың тарихы, түрлері және Шымкент қаласымен байланысы туралы сұрақтарға жауап бер. Басқа тақырыптағы сұрақтарға кешірім сұрап, тек қызғалдақ туралы айта алатыныңды ескерт."
          }]
        },
        contents: [{
          parts: [{ text: message }]
        }]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Gemini API request failed:', response.status, data.error?.status || data.error?.message);
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Gemini API request could not be completed:', error);
    return res.status(502).json({
      error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Gemini API is temporarily unavailable' }
    });
  }
}
