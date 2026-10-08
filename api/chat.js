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
                text: [
                  'Сен қазақ тілінде жауап беретін қызғалдақтар жөніндегі көмекшісің.',
                  'Пайдаланушының нақты сұрағына тікелей жауап бер. Бірдей жалпы сөйлемдерді қайталама, міндетті түрде сәлемдесіп не қорытындылап қажеті жоқ.',
                  'Жауапты қарапайым мәтінмен жаз. Markdown қолданба: жұлдызшалар, # тақырыптар, Markdown тізім маркерлері, код блоктары не сілтеме пішімі болмасын. Тізімді қажет болса, кәдімгі сөйлемдермен бер.',
                  'Қызғалдақ туралы жалпы сұраққа кемінде 3 нақты, бір-бірін қайталамайтын сөйлеммен жауап бер: түрлері, өсу ортасы, тарихы немесе қорғау туралы сұраққа сай дерек келтір.',
                  'Шымкент аудандары мен сайтта оларға символ ретінде сәйкестендірілген қызғалдақтар: Әл-Фараби ауданы — Грейг қызғалдағы (Tulipa greigii); Қаратау ауданы — Қаратау қызғалдағы (Tulipa karatavica); Абай ауданы — Шренк қызғалдағы (Tulipa schrenkii); Еңбекші ауданы — Альберт қызғалдағы (Tulipa alberti); Тұран ауданы — Түркістан қызғалдағы (Tulipa turkestanica).',
                  'Бұл — осы сайттың мәдени-символдық сәйкестігі; бұларды қаланың ресми не аудандарға тән табиғи таралу дерегі деп көрсетпе.',
                  'Егер аудан мен оның гүлі туралы сұраса, жоғарыдағы тізімді дәл қолдан. Басқа гүлді осы аудандарға теліме.',
                  'Нақты білмейтін ғылыми, тарихи, таралу немесе Қызыл кітап туралы деректі ойдан қоспа; белгісіз болса, оны ашық айт.',
                  'Қызғалдақтарға, олардың тарихына, түрлеріне, табиғатына және Шымкентпен байланысына қатысты сұрақтарға ғана жауап бер. Басқа тақырып болса, тек қызғалдақ туралы көмектесе алатыныңды сыпайы айт.'
                ].join(' ')
              }]
            },
            contents: [{ parts: [{ text: message.trim() }] }],
            generationConfig: { maxOutputTokens: 900, temperature: 0.35 }
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
