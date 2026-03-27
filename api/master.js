export default async function handler(req, res) {
  // Security settings (CORS) to allow the MyBB forum to receive data
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Response to a preliminary browser request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { text } = req.body;

    // Request to OpenRouter
    const response = await fetch("https://openrouter.ai", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.AI_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://mybb.ru",
        "X-Title": "AI Game Master for MyBB"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-exp:free",
        "messages": [
          { 
            "role": "system", 
            "content": "You are an experienced role-playing game master (GM). Your task: 1. Analyze the player's post. 2. Rate (from 1 to 10) for atmosphere and literacy. 3. Write an artistic continuation of the plot (2-3 paragraphs), which creates intrigue or challenges the character." 
          },
          { "role": "user", "content": `Player's post: ${text}` }
        ]
      })
    });

    const data = await response.json();

    // Check that OpenRouter has sent a response in the correct format
    if (data.choices && data.choices[0] && data.choices[0].message) {
        const aiMessage = data.choices[0].message.content;
        res.status(200).json({ ai_text: aiMessage });
    } else {
        // If the AI sent an error (for example, the limits have run out)
        const errorMsg = data.error ? data.error.message : "Unknown AI error";
        res.status(500).json({ error: errorMsg });
    }

  } catch (error) {
    // If the server itself broke
    res.status(500).json({ error: "Server error: " + error.message });
  }
}
