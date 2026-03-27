export default async function handler(req, res) {
  // Разрешаем запросы абсолютно отовсюду
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

  try {
    const { text } = req.body;

    const response = await fetch("https://openrouter.ai", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.AI_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://f-rpg.me", // Поправили реферер
        "X-Title": "AI Game Master"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-exp:free",
        "messages": [
          { 
            "role": "system", 
            "content": "Ты опытный мастер ролевых игр. Твоя задача: 1. Оценить пост игрока (атмосфера, грамотность). 2. Написать художественное продолжение сюжета (2-3 абзаца) на русском языке." 
          },
          { "role": "user", "content": text }
        ]
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
        res.status(200).json({ ai_text: data.choices[0].message.content });
    } else {
        res.status(500).json({ error: "Ошибка ИИ: " + (data.error ? data.error.message : "Пустой ответ") });
    }

  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера: " + error.message });
  }
}
