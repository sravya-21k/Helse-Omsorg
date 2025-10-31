// src/components/Navigation.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";



const API = import.meta.env.VITE_API_BASE ?? "http://localhost:4000/api";

export default function Navigation({ id, homeLabel = "Hjem", basePath = "/services" }) {
  const [trail, setTrail] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setTrail([]);
    setLoading(true);

    (async () => {
      try {
        const res = await fetch(`${API}/services/${id}/navigation`);
        const json = await res.json();
        if (!res.ok || json?.error) throw new Error(json?.error || `HTTP ${res.status}`);
        if (!alive) return;
        setTrail(Array.isArray(json) ? json : []);
      } catch {
        if (alive) setTrail([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [id]);

  return (
    <nav className="navigation" aria-label="Navigasjon">
      <ol className="nav-list">
        {/* Home */}
        <li className="nav-item">
          <Link className="nav-link home" to="/" aria-label={homeLabel}>
            <span className="home-icon" aria-hidden="true">🏠</span>
            <span className="home-text">{homeLabel}</span>
          </Link>
        </li>

        {/* Separator shimmer while loading */}
        {loading && (
          <li className="nav-item sep" aria-hidden="true">›</li>
        )}

        {/* Trail */}
        {!loading && trail.map((node, i) => {
          const isLast = i === trail.length - 1;
          return (
            <li key={node.id} className="nav-item">
              <span className="sep" aria-hidden="true">›</span>
              {isLast ? (
                <span className="nav-current" title={node.navn || `#${node.id}`}>
                  {node.navn || `#${node.id}`}
                </span>
              ) : (
                <Link
                  className="nav-link crumb"
                  to={`${basePath}/${node.id}`}
                  title={node.navn || `#${node.id}`}
                >
                  {node.navn || `#${node.id}`}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
