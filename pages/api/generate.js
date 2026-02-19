async function getWikiImage(term) {
  const s1 = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`
  ).catch(() => null);

  if (s1 && s1.ok) {
    const j1 = await s1.json().catch(() => ({}));
    if (j1?.thumbnail?.source) return j1.thumbnail.source;
  }

  const search = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&format=json&origin=*`
  ).catch(() => null);

  if (!search || !search.ok) return "";

  const js = await search.json().catch(() => ({}));
  const title = js?.query?.search?.[0]?.title;
  if (!title) return "";

  const s2 = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
  ).catch(() => null);

  if (!s2 || !s2.ok) return "";

  const j2 = await s2.json().catch(() => ({}));
  return j2?.thumbnail?.source || "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { term } = req.body || {};
  if (!term) return res.status(400).json({ error: "Missing term" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Missing OPENAI_API_KEY" });

  try {
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "اكتب فقط 4 أسطر بهذا الشكل:\nEnglish term: ...\nPronunciation (Arabic letters): ...\nالمعنى بالعربي: ...\nالتعريف بالعربي: ..."
          },
          { role: "user", content: `المصطلح: ${term}` }
        ]
      })
    });

    const aiData = await aiRes.json();
    const text = aiData?.choices?.[0]?.message?.content || "";

    const imageUrl = await getWikiImage(term);

    res.status(200).json({ text, imageUrl });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}
