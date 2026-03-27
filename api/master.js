export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

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
        "HTTP-Referer": "https://f-rpg.me",
        "X-Title": "AI GM"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-exp:free",
        "messages": [
          { "role": "system", "content": "Ты — мастер ролевой игры. Оцени пост и напиши продолжение на русском." },
          { "role": "user", "content": text }
        ]
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
        res.status(200).json({ ai_text: data.choices[0].message.content });
    } else {
        res.status(500).json({ error: "No response from AI", details: data });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
