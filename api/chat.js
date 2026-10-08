export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: {
        code: 'MISSING_OPENROUTER_API_KEY',
        message: 'OPENROUTER_API_KEY is not configured on the server'
      }
    });
  }

  const message = req.body?.message;
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: { message: 'Message is required' } });
  }
  if (message.length > 2000) {
    return res.status(413).json({ error: { message: 'Message is too long' } });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://tulip-three-sigma.vercel.app',
        'X-Title': 'Qyzğaldaq'
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'openrouter/free',
        messages: [
          {
            role: 'system',
            content: 'Сен Қызғалдақ (тюльпан) туралы сарапшысың. Қазақ тілінде қысқа, түсінікті әрі сыпайы жауап бер. Тек қана қызғалдақтар, олардың тарихы, түрлері және Шымкент қаласымен байланысы туралы сұрақтарға жауап бер. Басқа тақырыптағы сұрақтарға кешірім сұрап, тек қызғалдақ туралы айта алатыныңды ескерт.'
          },
          { role: 'user', content: message.trim() }
        ],
        max_tokens: 600
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('OpenRouter request failed:', response.status, data.error?.code || data.error?.message);
      const status = response.status === 429 ? 429 : response.status >= 500 ? 502 : response.status;
      return res.status(status).json({
        error: {
          code: data.error?.code || response.status,
          message: response.status === 429
            ? 'The free model is temporarily rate limited. Please try again later.'
            : 'The AI provider could not complete the request.'
        }
      });
    }

    const answer = data.choices?.[0]?.message?.content;
    if (typeof answer !== 'string' || !answer.trim()) {
      console.error('OpenRouter returned no text completion:', data.error?.code || 'empty response');
      return res.status(502).json({
        error: { code: 'EMPTY_COMPLETION', message: 'The AI provider returned an empty response.' }
      });
    }

    return res.status(200).json({ answer: answer.trim() });
  } catch (error) {
    console.error('OpenRouter request could not be completed:', error);
    return res.status(502).json({
      error: { code: 'UPSTREAM_UNAVAILABLE', message: 'The AI provider is temporarily unavailable.' }
    });
  }
}
