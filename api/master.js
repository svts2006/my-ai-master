export default async function handler(req, res) {
  // Разрешаем форуму обращаться к боту
  res.setHeader('Access-Control-Allow-Origin', 'https://cimeria.f-rpg.me/');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { text } = req.body;

    const response = await fetch("https://openrouter.ai", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.AI_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://mybb.ru",
        "X-Title": "AI Game Master"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-exp:free",
        "messages": [
          { "role": "system", "content": "Ты мастер ролевой игры. Оцени пост и напиши продолжение." },
          { "role": "user", "content": text }
        ]
      })
    });

    const data = await response.json();
    
    // Проверка на ошибки от OpenRouter
    if (data.error) {
       return res.status(500).json({ error: data.error.message });
    }

    res.status(200).json({ ai_text: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
