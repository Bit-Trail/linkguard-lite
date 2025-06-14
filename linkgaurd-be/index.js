const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/check-links", async (req, res) => {
  const { url } = req.body;

  try {
    const response = await axios.get(link, {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  },
});
    const $ = cheerio.load(response.data);
    const links = [];

    $("a").each((_, element) => {
      const href = $(element).attr("href");
      if (href && href.startsWith("http")) {
        links.push(href);
      }
    });

    const results = await Promise.all(
      links.map(async (link) => {
        try {
          const r = await axios.get(link);
          return { url: link, status: r.status };
        } catch (err) {
          return { url: link, status: err.response?.status || "Error" };
        }
      })
    );

    res.json({ links: results });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch or parse the URL" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🔗 LinkGuard API running at http://localhost:${PORT}`);
});