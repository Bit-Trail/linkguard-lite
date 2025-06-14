const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/check-links", async (req, res) => {
  const { url } = req.body;

  // ✅ Validate input
  if (!url || typeof url !== "string" || !url.startsWith("http")) {
    return res.status(400).json({ error: "Invalid URL provided" });
  }

  try {
    // ✅ Try fetching the webpage with timeout
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      timeout: 8000, // 8 seconds max
    });

    let $;
    try {
      $ = cheerio.load(response.data); // ✅ Cheerio may crash on bad HTML
    } catch (e) {
      return res.status(500).json({ error: "Failed to parse HTML" });
    }

    // ✅ Extract links
    const links = [];
    $("a").each((_, el) => {
      const href = $(el).attr("href");
      if (href?.startsWith("http")) links.push(href);
    });

    // ✅ Limit number of scanned links
    const limitedLinks = links.slice(0, 30); // max 30

    // ✅ Scan links with individual error handling
    const results = await Promise.all(
      limitedLinks.map(async (link) => {
        try {
          const r = await axios.get(link, { timeout: 5000 });
          return { url: link, status: r.status };
        } catch (err) {
          return {
            url: link,
            status:
              err?.response?.status ||
              err?.code || // like ECONNRESET, ETIMEDOUT
              "Error",
          };
        }
      })
    );

    return res.json({ links: results });
  } catch (err) {
    console.error("🔥 Server error:", err.message);
    return res
      .status(500)
      .json({ error: "Failed to fetch or process the main URL" });
  }
});

// ✅ Optional: catch unhandled rejections globally
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🔗 LinkGuard API running at http://localhost:${PORT}`);
});
