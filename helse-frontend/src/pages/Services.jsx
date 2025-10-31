import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";




const API = import.meta.env.VITE_API_BASE ?? "http://localhost:4000/api";
const PAGE_SIZE = 20;

export default function Services() {
  // --- URL params drive data loading ---
  const [params, setParams] = useSearchParams();
  const qParam = params.get("q") ?? "";
  const page   = Number(params.get("page") ?? "0");
  const sort   = params.get("sort") ?? "navn";
  const order  = params.get("order") ?? "asc";
const navigate = useNavigate()
  // --- local state for smooth typing ---
  const [qInput, setQInput] = useState(qParam);
  useEffect(() => { setQInput(qParam); }, [qParam]); // keep in sync when URL changes externally

  // helper to set multiple params in ONE update (prevents loops)
  const setParamsBatch = (entries) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of entries) {
      if (v === "" || v == null) next.delete(k);
      else next.set(k, String(v));
    }
    setParams(next, { replace: false });
  };

  // debounce: after 300ms of typing, push to URL ONCE (q + page=0)
  useEffect(() => {
    const t = setTimeout(() => {
      if (qInput !== qParam) {
        setParamsBatch([["q", qInput], ["page", 0]]);
      }
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qInput, qParam]); // only react to typing vs current URL value

  // --- data state ---
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canPrev = !loading && page > 0;
  const canNext = !loading && page < totalPages - 1;

  // build query string (memoized)
  const qs = useMemo(() => {
    const u = new URLSearchParams({
      q: qParam,
      skip: String(page * PAGE_SIZE),
      limit: String(PAGE_SIZE),
      sort, order
    });
    return u.toString();
  }, [qParam, page, sort, order]);

  // load when URL-driving params change
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API}/services?${qs}`, { signal: ctrl.signal });
        const json = await res.json();
        if (!res.ok || json?.error) throw new Error(json?.error || `HTTP ${res.status}`);
        setRows(json.items || []);
        setTotal(typeof json.total === "number" ? json.total : (json.items?.length ?? 0));
      } catch (e) {
        if (e.name === "AbortError") return; // ignore aborted request
        setRows([]);
        setTotal(0);
        setError(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort(); // cancel if params change quickly
  }, [qs]); // single dependency keeps it stable

  function highlight(text,q){
    if(!q)return text
    const i = text.toLowerCase().indexOf(q.toLowerCase())
    if(i === -1) return text
    return(
      <>
      {text.slice(0,i)}
      <mark>{text.slice(i,i + q.length)}</mark>
      {text.slice(i +q.length)}
      </>
    )
  }

  // --- UI ---
  return (
    <>
      <h2 className="section-title">Tjenester</h2>

      <div className="searchbar" style={{ gap: 8, flexWrap: "wrap" }}>
        <input
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          onKeyDown={(e) => {
            if(e.key === 'Enter' && /^\d+$/.test(qInput)){
                navigate(`/services/${qInput}`)
            }
          }}
          placeholder="Søk etter tjeneste…"
          aria-label="Søk etter tjeneste"
          autoComplete="off"
        />
        <button className="btn" onClick={() => setParamsBatch([["q",""],["page",0]])}>
          Tøm
        </button>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <label className="muted">Sortering:</label>
          <select
            value={sort}
            onChange={(e) => setParamsBatch([["sort", e.target.value], ["page", 0]])}
          >
            <option value="navn">Navn</option>
            <option value="id">ID</option>
          </select>
          <button
            className="btn"
            onClick={() => setParamsBatch([["order", order === "asc" ? "desc" : "asc"], ["page", 0]])}
            title="Bytt rekkefølge"
          >
            {order === "asc" ? "A-Å" : "Å-A"}
          </button>
        </div>
      </div>

      <div className="divider" />

      {loading && <div className="center"><p>Laster…</p></div>}
      {!loading && error && <div className="center"><p>Feil: {error}</p></div>}
      {!loading && !error && rows.length === 0 && (
        <div className="center"><p className="muted">Ingen treff.</p></div>
      )}

      <div className="card-grid">
        {rows.map((s) => (
          <article key={s.id} className="card">
            <h3><Link to={`/services/${s.id}`}>{highlight(s.navn || `#${s.id}`, qParam)}</Link></h3>
            <div className="meta">ID: {s.id}</div>
          </article>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "center" }}>
        <button className="btn" disabled={!canPrev} onClick={() => setParamsBatch([["page", Math.max(0, page - 1)]])}>
          Forrige
        </button>
        <button className="btn" disabled={!canNext} onClick={() => setParamsBatch([["page", page + 1]])}>
          Neste
        </button>
        <span className="muted">Side {Math.min(page + 1, totalPages)} av {totalPages}</span>
      </div>
    </>
  );
}

function highlight(text, query) {
  if (!query) return text;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return text;
  const a = text.slice(0, i);
  const b = text.slice(i, i + query.length);
  const c = text.slice(i + query.length);
  return (
    <span>
      {a}
      <mark style={{ background: "transparent", color: "var(--brand)" }}>{b}</mark>
      {c}
    </span>
  );
}
