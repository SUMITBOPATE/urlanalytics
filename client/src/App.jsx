// Shurl landing — UI shell, LOGIC TODO by you.
// Backend you built: POST /api/shorten -> 201 {shortUrl}, GET /:code -> 302.
import { useState } from 'react';

const features = [
  { e: '⚡', t: '7-char links', d: 'Random URL-safe slugs. Short to share, huge space (62⁷ combos).' },
  { e: '⏳', t: '24h expiry', d: 'Every link auto-expires. Expired visits get 410 + row deleted.' },
  { e: '📊', t: 'Click counts', d: 'Each redirect does +1. See what gets clicked.' },
];

const steps = [
  { n: '1', t: 'Paste long URL', d: 'Any http(s) link. We validate + normalize.' },
  { n: '2', t: 'Get shurl', d: 'Random 7-char slug, saved as short_code → long_url.' },
  { n: '3', t: 'Share + track', d: '302 redirect every visit, so expiry + counts stay true.' },
];

export default function App() {
  const [longUrl, setLongUrl] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyShort() {
    if (!result?.shortUrl) return;
    try {
      await navigator.clipboard.writeText(result.shortUrl);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = result.shortUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const isExpired = result?.expiresAt ? new Date(result.expiresAt) < new Date() : false;
  const shortHost = result?.shortUrl ? result.shortUrl.replace(/^https?:\/\//, '') : '';
  const longShort = result?.longUrl
    ? (result.longUrl.length > 42 ? result.longUrl.slice(0, 42) + '…' : result.longUrl)
    : '';


  async function handleShorten(e)  {
     e.preventDefault();
  setError('');
  setResult(null);
setLoading(true);
const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
   try{
      const res =       await fetch(`${API}/api/shorten`, {
                 'method': 'POST',
                  headers:   {'Content-Type':'application/json'},
                        
                body:JSON.stringify({longUrl}),
                }
          )
           const data =await res.json();
           if (!res.ok) {
                  setError(data.error || 'Failed to shorten.');
            } else {
                 setResult(data);
              }
           } catch (err) {
                         setError('Server unreachable. Is localhost:3000 running?');
        } finally {
           setLoading(false);
           }
          }
  return (
    <div className="page">
      <div className="hero">
        <span className="pill">SHURL • SHORT LINKS</span>
        <h1>Short links that land<br /><span>right place, every time</span></h1>
        <p>Paste a long URL, get a 7-char shurl. Auto-expires in 24h, counts every click.</p>
        <div className="hero-cta">
          <a href="#shorten" className="cta">Shorten a link</a>
          <button className="learn" type="button">Learn more</button>
        </div>
      </div>

      <div className="card" id="shorten">
        <form onSubmit={handleShorten}>
          <div className="row">
            <span className="linkico">🔗</span>
            <input
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              placeholder="Shorten any link..."
            />
            <button type="submit" disabled={loading}>
              {loading ? '...' : 'Shorten link'}
            </button>
          </div>
        </form>
        {error && <p className="err">{error}</p>}
        {result && (
          <div className="linkrow">
            <div className="fav">🔗</div>
            <div className="linkmain">
              <div className="shortline">
                <a href={result.shortUrl} target="_blank" rel="noreferrer">{shortHost}</a>
                <button type="button" className="iconbtn copybtn" onClick={() => { console.log('copy click', result?.shortUrl); copyShort(); }} title="Copy short link">
                  {copied ? '✓' : '⧉'}
                </button>
                <span className="iconbtn faded" title="QR coming soon">▦</span>
              </div>
              <div className="longline">↳ {result.longUrl ? result.longUrl.replace(/^https?:\/\//, '') : longShort}</div>
              {copied && <div className="muted">Copied!</div>}
            </div>
            <div className="linkside">
              <span className="clickpill">☄ {result.clickCount ?? 0} clicks</span>
              {isExpired && <span className="expired">⚠ EXPIRED</span>}
            </div>
            <span className="dots">⋮</span>
          </div>
        )}
        {!result && !error && (
          <div className="out muted">🔗 shurl/••••••• — your short link will appear here.</div>
        )}
      </div>

      <section className="section">
        <h2>Why Shurl?</h2>
        <div className="grid">
          {features.map((f) => (
            <div key={f.t} className="feat">
              <div className="feat-e">{f.e}</div>
              <b>{f.t}</b>
              <p>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>How it works</h2>
        <div className="grid">
          {steps.map((s) => (
            <div key={s.n} className="feat">
              <div className="feat-e">{s.n}</div>
              <b>{s.t}</b>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="foot">
        <span>🔗 Shurl — Express • React • Postgres (Neon)</span>
        <span className="muted">24h expiry • 410 gone • 302 redirects</span>
      </footer>
    </div>
  );
}
