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
    return res.status(400).json({ error: "Invalid URL provided" });
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
      return res.status(500).json({ error: "Failed to parse HTML" });
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
          const r = await axios.get(link, {
            timeout: 5000,
            headers: {
              "User-Agent": "Mozilla/5.0",
            },
          });
          return { url: link, status: r.status, message: "OK" };
        } catch (err) {
          let message = "Unknown error";
          if (err.code === "ECONNABORTED") message = "⏱️ Timeout";
          else if (err.code === "ENOTFOUND") message = "🌐 DNS failed";
          else if (err.response?.status === 403) message = "🔒 Blocked by site (403)";
          else if (err.response?.status === 429) message = "🚫 Too many requests (429)";
          else if (err.code) message = `❌ ${err.code}`;
          else if (err.message) message = err.message;

          return {
            url: link,
            status: err?.response?.status || "Error",
            message,
          };
        }
      })
    );

    return res.json({ links: results });
  } catch (err) {
    console.error("🔥 Server error:", err.message);
    return res.status(500).json({ error: "Failed to fetch or process the main URL" });
  }
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🔗 LinkGuard API running at http://localhost:${PORT}`);
});