// Shurl landing — UI shell, LOGIC TODO by you.
// Backend you built: POST /api/shorten -> 201 {shortUrl}, GET /:code -> 302.
import { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
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
  const [copiedCode, setCopiedCode] = useState('');
  // Per-device history: newest first, survives reloads. No login for v1.
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('shurl-history') || '[]');
    } catch {
      return [];
    }
  });
  // Tick so expired rows fade live without reload.
  const [, setNowTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setNowTick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('shurl-history', JSON.stringify(history.slice(0, 20)));
    } catch { /* storage full/blocked: history just won't persist */ }
  }, [history]);

  async function copyText(text, code) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 1500);
  }

  const rowExpired = (row) => (row?.expiresAt ? new Date(row.expiresAt) < new Date() : false);
  const hostOf = (url) => (url ? url.replace(/^https?:\/\//, '') : '');
  const destOf = (url) => {
    const h = hostOf(url);
    return h.length > 42 ? h.slice(0, 42) + '…' : h;
  };

  // Fresh truth per row: ask stats endpoint, update only that entry.
  // Why separate call? Birth snapshot (POST) freezes clicks at 0; visits happen later.
  async function refreshRow(code) {
    const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    try {
      const res = await fetch(`${API}/api/stats/${code}`);
      if (!res.ok) return;
      const data = await res.json();
      setHistory((h) =>
        h.map((e) =>
          e.shortCode === code
            ? { ...e, clickCount: data.click_count ?? data.clickCount ?? e.clickCount ?? 0, expiresAt: data.expires_at || data.expiresAt || e.expiresAt }
            : e
        )
      );
    } catch { /* offline: keep old number, no lie */ }
  }


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
                 const entry = {
                   shortCode: data.shortCode,
                   shortUrl: data.shortUrl,
                   longUrl: data.longUrl || longUrl,
                   expiresAt: data.expiresAt,
                   clickCount: data.clickCount ?? 0,
                   createdAt: Date.now(),
                 };
                 setResult(entry);
                 setHistory((h) => [entry, ...h.filter((e) => e.shortCode !== entry.shortCode)].slice(0, 20));
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
        {history.length === 0 && !error && (
          <div className="out muted">🔗 shurl/••••••• — your short links will stack here, newest on top.</div>
        )}
        {history.map((row) => {
          const expired = rowExpired(row);
          const isCopied = copiedCode === row.shortCode;
          return (
            <div key={row.shortCode} className={`linkrow${expired ? ' fadedrow' : ''}`}>
              <div className="fav">🔗</div>
              <div className="linkmain">
                <div className="shortline">
                  <a href={row.shortUrl} target="_blank" rel="noreferrer">{hostOf(row.shortUrl)}</a>
                  <button type="button" className="iconbtn copybtn" onClick={() => copyText(row.shortUrl, row.shortCode)} title="Copy short link">
                    {isCopied ? '✓' : '⧉'}
                  </button>
                  <span className="iconbtn faded" title="QR coming soon">▦</span>
                </div>
                <div className="longline">↳ {destOf(row.longUrl)}</div>
                {isCopied && <div className="muted">Copied!</div>}
              </div>
            <div className="linkside">
              <span className="clickpill">☄ {row.clickCount ?? 0} clicks
                <button type="button" className="iconbtn refreshbtn" onClick={() => refreshRow(row.shortCode)} title="Refresh clicks">↻</button>
              </span>
              {expired && <span className="expired">⚠ EXPIRED</span>}
            </div>
              <span className="dots">⋮</span>
            </div>
          );
        })}
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
