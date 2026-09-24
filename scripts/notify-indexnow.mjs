/**
 * PortfolioHubs - Instant Search Engine Notification via IndexNow
 * Pings Bing, Yandex, and other search engines when doctor portfolios or articles are published.
 */

export async function submitIndexNowUrls(urls = [], host = 'portfoliohubs.github.io', key = 'c74389df0b2149bfa892e624d623b371') {
  if (!urls || urls.length === 0) return { ok: true, message: 'No URLs to submit.' };

  const keyLocation = `https://${host}/${key}.txt`;
  const payload = {
    host,
    key,
    keyLocation,
    urlList: urls
  };

  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow'
  ];

  const results = [];
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload)
      });
      results.push({ endpoint, status: response.status, ok: response.ok });
    } catch (err) {
      results.push({ endpoint, error: err.message, ok: false });
    }
  }

  return { ok: results.some(r => r.ok), results };
}

// CLI direct run
if (import.meta.url === `file://${process.argv[1]}`) {
  const sampleUrls = [
    'https://portfoliohubs.github.io/',
    'https://portfoliohubs.github.io/about',
    'https://portfoliohubs.github.io/docs',
    'https://portfoliohubs.github.io/blog',
    'https://portfoliohubs.github.io/dr/drmichaelnabil/'
  ];
  console.log('Submitting IndexNow URLs...');
  submitIndexNowUrls(sampleUrls).then(res => {
    console.log('IndexNow result:', res);
  }).catch(console.error);
}
