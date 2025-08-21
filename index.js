const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json());

app.post('/scrape', async (req, res) => {
  const { url, selector } = req.body;

  if (!url || !selector) {
    return res.status(400).json({ error: 'Missing url or selector' });
  }

  const cleanUrl = url.trim();

  // Robust URL validation
  try {
    new URL(cleanUrl);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format. Please provide a fully qualified URL.' });
  }

  const cleanSelector = selector.trim();

  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(cleanUrl);
    await page.waitForSelector(selector, { timeout: 5000 });
    const html = await page.content();
    res.json({ html: html });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  finally {
    await browser.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});