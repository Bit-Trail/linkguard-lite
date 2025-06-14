const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/check-links", async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== "string" || !url.startsWith("http")) {
    return res.status(200).json({ ok: false, error: "Invalid URL provided" });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      timeout: 8000,
    });

    let $;
    try {
      $ = cheerio.load(response.data);
    } catch (e) {
      return res.status(200).json({ ok: false, error: "Failed to parse HTML" });
    }

    const links = [];
    $("a").each((_, el) => {
      const href = $(el).attr("href");
      if (href?.startsWith("http")) links.push(href);
    });

    const limitedLinks = links.slice(0, 30);

    const results = await Promise.all(
      limitedLinks.map(async (link) => {
        try {
          const r = await axios.get(link, { timeout: 5000 });
          return { url: link, status: r.status };
        } catch (err) {
          return {
            url: link,
            status:
              err?.response?.status || err?.code || "Unknown error",
          };
        }
      })
    );

    return res.status(200).json({ ok: true, links: results });
  } catch (err) {
    console.error("Server error:", err.message);
    return res.status(200).json({ ok: false, error: "Could not fetch the page." });
  }
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🔗 LinkGuard API running at http://localhost:${PORT}`);
});