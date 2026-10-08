export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: {
        code: 'MISSING_GEMINI_API_KEY',
        message: 'GEMINI_API_KEY is not configured on the server'
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

  const models = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'];

  try {
    for (const [index, model] of models.entries()) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{
                text: 'Сен Қызғалдақ (тюльпан) туралы сарапшысың. Қазақ тілінде қысқа, түсінікті әрі сыпайы жауап бер. Тек қана қызғалдақтар, олардың тарихы, түрлері және Шымкент қаласымен байланысы туралы сұрақтарға жауап бер. Басқа тақырыптағы сұрақтарға кешірім сұрап, тек қызғалдақ туралы айта алатыныңды ескерт.'
              }]
            },
            contents: [{ parts: [{ text: message.trim() }] }],
            generationConfig: { maxOutputTokens: 600 }
          })
        }
      );

      let data;
      try {
        data = await response.json();
      } catch (error) {
        console.error('Gemini returned invalid JSON:', model, response.status, error.name);
        return res.status(502).json({
          error: {
            code: 'INVALID_UPSTREAM_RESPONSE',
            message: 'The AI provider returned an invalid response.'
          }
        });
      }

      if (response.status === 429 && index < models.length - 1) {
        console.warn('Gemini model rate limited; trying fallback model:', model);
        continue;
      }

      if (!response.ok) {
        console.error('Gemini request failed:', model, response.status, data?.error?.status || data?.error?.message);
        return res.status(response.status >= 500 ? 502 : response.status).json({
          error: {
            code: response.status === 429 ? 'ALL_MODELS_RATE_LIMITED' : data?.error?.status || response.status,
            message: response.status === 429
              ? 'The available Gemini models are temporarily rate limited.'
              : 'The AI provider could not complete the request.'
          }
        });
      }

      const answer = data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text)
        .filter(Boolean)
        .join('\n');
      if (!answer?.trim()) {
        console.error('Gemini returned no text completion:', model, data?.promptFeedback?.blockReason || 'empty response');
        return res.status(502).json({
          error: { code: 'EMPTY_COMPLETION', message: 'The AI provider returned an empty response.' }
        });
      }

      return res.status(200).json({ answer: answer.trim() });
    }
  } catch (error) {
    const providerCode = error?.cause?.code || error?.code || error?.name || 'UNKNOWN';
    console.error('Gemini request could not be completed:', providerCode, error?.message);
    return res.status(502).json({
      error: {
        code: 'UPSTREAM_UNAVAILABLE',
        providerCode,
        message: 'The AI provider is temporarily unavailable.'
      }
    });
  }

  return res.status(429).json({
    error: {
      code: 'ALL_MODELS_RATE_LIMITED',
      message: 'The available Gemini models are temporarily rate limited.'
    }
  });
}
