import "../styles/ServiceInfo.css";

export default function ServiceInfo({ data }) {
  if (!data) return null;

  // Fallback values for missing fields
  const fallback = (value) => value && value.trim() ? value : "Ikke tilgjengelig";

  return (
    <section className="service-info">
      <p className="service-desc">
        <strong>📝 Beskrivelse:</strong> {fallback(data.beskrivelse)}
      </p>

      <div className="service-attributes">
      <p>
  <strong>🧍 Kontaktperson:</strong> {fallback(data.kontaktperson)}
</p>

        <p>
          <strong>☎️ Supporttelefon:</strong>{" "}
          {data.supporttelefon ? (
            <a href={`tel:${data.supporttelefon}`}>{data.supporttelefon}</a>
          ) : (
            "Ikke tilgjengelig"
          )}
        </p>
        <p>
          <strong>📧 Supportepost:</strong>{" "}
          {data.supportepost ? (
            <a href={`mailto:${data.supportepost}`}>{data.supportepost}</a>
          ) : (
            "Ikke tilgjengelig"
          )}
        </p>
      </div>
    </section>
  );
}
