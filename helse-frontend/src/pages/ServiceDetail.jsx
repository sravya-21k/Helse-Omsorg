import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useOutletContext, useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import ServiceInfo from "../components/ServiceInfo";
import "../styles/ServiceDetail.css";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

export default function ServiceDetail() {
  const { id } = useParams();// Optional language support
  const [data, setData] = useState(null);
  const [relations, setRelations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const navigate = useNavigate();

  // Back navigation
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1); // Go back
    } else {
      navigate("/services", { replace: true });
    }
  };

  // Fetch service details
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    setIsCopied(false);

    (async () => {
      try {
        const res = await fetch(`${API}/services/${id}`);
        const json = await res.json();
        if (!res.ok || json?.error) throw new Error(json?.error || `HTTP ${res.status}`);
        if (!alive) return;
        console.log("🔍 Service data:", json);
        setData(json || null);
        const rels = json?.relasjoner ?? json?.relations ?? [];
        setRelations(Array.isArray(rels) ? rels : []);
      } catch (e) {
        if (alive) setError(e.message || String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  // Copy page link
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  //  Sort relations (alphabetically, stable)
  const sortedRelations = useMemo(() => {
    return [...relations].sort((a, b) => {
      const an = (a.navn || "").localeCompare(b.navn || "", "nb");
      if (an !== 0) return an;
      const at = (a.relType || "").localeCompare(b.relType || "", "nb");
      if (at !== 0) return at;
      return String(a.id).localeCompare(String(b.id), "nb");
    });
  }, [relations]);

  // Loading and error handling
  if (loading) {
    return (
      <div className="service-detail">
        <p>Laster data...</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="service-detail">
        <h2>Kunne ikke laste tjenesten</h2>
        <p className="muted">{err}</p>
        <p>
          <Link className="btn" to="/services">
            ← Til tjenester
          </Link>
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="service-detail">
        <h2>Ingen data funnet</h2>
        <p>
          <Link className="btn" to="/services">
            ← Til tjenester
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="service-detail">
      <div className="topbar">
        <button className="back-btn" onClick={handleBack}>
          ← Tilbake
        </button>
        <button className="copy-btn" onClick={handleCopy}>
          {isCopied ? "✅ Kopiert!" : "🔗 Kopier lenke"}
        </button>
      </div>

      <h2 className="service-title">{data.navn || "Tjeneste"}</h2>

      {/*  Attributes */}
      <ServiceInfo data={data} />

      {/*  Navigation trail (breadcrumb) */}
      <Navigation id={Number(id)} />

      <hr className="divider" />

      {/*  Relations list */}
      <section aria-labelledby="rel-heading" style={{ marginTop: "1rem" }}>
        <h4 id="rel-heading">Relasjoner</h4>

        {sortedRelations.length > 0 ? (
          <div className="relations-grid">
            {sortedRelations.map((r) => (
              <div
                key={`${r.id}-${r.relId ?? r.relType ?? "rel"}`}
                className="relation-card"
              >
                <h4>{r.navn || "Uten navn"}</h4>

                <div className="relation-meta">
                  <p>
                    <strong>Relasjonstype:</strong>{" "}
                    {r.relType ? r.relType.toUpperCase() : "UKJENT"}
                  </p>

                  {r.dir && (
                    <p>
                      <strong>Retning:</strong>{" "}
                      <span className={`dir-badge ${r.dir}`}>
                        {r.dir === "out" ? "➡️ UT" : "⬅️ INN"}
                      </span>
                    </p>
                  )}

                  {r.labels && r.labels.length > 0 && (
                    <p>
                      <strong>Rolle:</strong> ({r.labels.join(", ")})
                    </p>
                  )}
                </div>

                <Link to={`/services/${r.id}`} className="relation-link">
                  Se detaljer
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">
          Ingen relasjoner funnet.
          </p>
        )}
      </section>
    </div>
  );
}
