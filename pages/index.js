import { useMemo, useState } from "react";

const RLM = "\u200F"; // علامة RTL خفية (مفيدة للنسخ إلى Word)

export default function Home() {
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState("");
  const [img, setImg] = useState("");
  const [err, setErr] = useState("");
  const [dark, setDark] = useState(true);

  const display = useMemo(() => out, [out]);

  async function generate() {
    setErr("");
    setOut("");
    setImg("");

    const t = term.trim();
    if (!t) return;

    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: t })
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error(data?.error || "Server error");

      const text = String(data.text || "");
      const fixed = text
        .split("\n")
        .map((l) => (l ? RLM + l : l))
        .join("\n");

      setOut(fixed);
      setImg(data.imageUrl || "");
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!display) return;
    await navigator.clipboard.writeText(display);
  }

  return (
    <div className={dark ? "dark" : ""} dir="rtl" lang="ar">
      <style jsx global>{`
        :root { color-scheme: light dark; }
        body { margin:0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; }
        .wrap{
          min-height:100vh;
          padding:24px;
          background: linear-gradient(180deg, #f5f3ff, #ffffff);
          color:#111827;
        }
        .dark .wrap{
          background:
            radial-gradient(1200px 600px at 50% -10%, rgba(124,58,237,0.35), transparent),
            linear-gradient(180deg, #0b0716, #0a0a0f);
          color:#f3f4f6;
        }
        .card{
          max-width: 980px;
          margin: 0 auto;
          background: rgba(255,255,255,0.78);
          border: 1px solid rgba(124,58,237,0.22);
          border-radius: 18px;
          padding: 18px;
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.06);
        }
        .dark .card{
          background: rgba(17, 10, 35, 0.55);
          border: 1px solid rgba(124,58,237,0.30);
          box-shadow: 0 10px 30px rgba(0,0,0,0.35);
        }
        h1{ margin:0 0 6px; font-size: 22px; }
        .sub{ margin:0 0 16px; opacity:0.85; font-size: 13px; }
        .row{ display:flex; gap:10px; flex-wrap: wrap; align-items: center; }
        input{
          flex: 1 1 520px;
          padding: 14px 14px;
          border-radius: 14px;
          border: 1px solid rgba(124,58,237,0.28);
          background: rgba(255,255,255,0.92);
          outline: none;
          font-size: 16px;
        }
        .dark input{
          background: rgba(10,10,15,0.65);
          color:#f3f4f6;
          border: 1px solid rgba(124,58,237,0.38);
        }
        button{
          padding: 14px 14px;
          border-radius: 14px;
          border: 0;
          cursor: pointer;
          font-weight: 900;
          background: #7c3aed;
          color: white;
        }
        button:disabled{ opacity:0.6; cursor:not-allowed; }
        .ghost{
          background: transparent;
          border: 1px solid rgba(124,58,237,0.50);
          color: inherit;
        }
        textarea{
          width:100%;
          height: 220px;
          margin-top: 12px;
          border-radius: 14px;
          border: 1px solid rgba(124,58,237,0.28);
          padding: 12px;
          background: rgba(255,255,255,0.92);
          font-size: 13px;
          line-height: 1.65;
          white-space: pre-wrap;
        }
        .dark textarea{
          background: rgba(10,10,15,0.65);
          color:#f3f4f6;
          border: 1px solid rgba(124,58,237,0.38);
        }
        .err{ margin-top: 10px; color: #ef4444; font-size: 13px; }
        .topbar{ display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom: 10px; }
        .imgbox{ margin-top: 14px; display:flex; justify-content:center; }
        img{ max-width: 420px; width: 100%; border-radius: 14px; border: 1px solid rgba(124,58,237,0.25); }
      `}</style>

      <div className="wrap">
        <div className="card">
          <div className="topbar">
            <div>
              <h1>مُعرِّف المصطلحات (ذكاء اصطناعي)</h1>
              <p className="sub">اكتب المصطلح (إنجليزي أو عربي) → 4 أسطر RTL + صورة.</p>
            </div>
            <button className="ghost" onClick={() => setDark(!dark)}>
              {dark ? "☀️ فاتح" : "🌙 ليلي"}
            </button>
          </div>

          <div className="row">
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e) => (e.key === "Enter" ? generate() : null)}
              placeholder="مثال: Osteomyelitis"
            />
            <button onClick={generate} disabled={loading}>
              {loading ? "..." : "Generate"}
            </button>
            <button className="ghost" onClick={copy} disabled={!display}>
              Copy
            </button>
          </div>

          {err ? <div className="err">{err}</div> : null}

          {img ? (
            <div className="imgbox">
              <img src={img} alt="result" />
            </div>
          ) : null}

          <textarea readOnly value={display} placeholder="الناتج يظهر هنا…" />
        </div>
      </div>
    </div>
  );
}
