const express = require('express');
const puppeteer = require('puppeteer');
const os = require('os')

const app = express();
app.use(express.json());

app.get('/ping', (req, res) => {
  console.log('Ping received');
  res.send(`hello from ${os.hostname()}`);
});

app.post('/scrape', async (req, res) => {
  const { url, selector } = req.body;
  console.log("received scrape post")
  console.log("url " + url)
  console.log("selector " + selector)

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

  let browser;
  try {
    browser = await puppeteer.launch({
          headless: 'new', // or true
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    const page = await browser.newPage();
    await page.goto(cleanUrl);
    await page.waitForSelector(selector, { timeout: 5000 });
    const html = await page.content();
    res.json({ html: html });
  } catch (err) {
    console.error('Scrape failed:', err);
    res.status(500).json({ error: err.message });
  }
  finally {
    await browser.close();
  }
});

const env = process.env.APP_ENV || 'dev';
if(env === 'docker') {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on host ${os.hostname()} and port ${port} and container network interface`);
  });
}
else {
  app.listen(port, () => {
    console.log(`Server running on host ${os.hostname()} and port ${port} and default interfaces`);
  });
}
