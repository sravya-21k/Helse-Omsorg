import { useEffect, useState } from "react";
import { Link } from "react-router-dom"
import "../styles/Home.css"

const API = import.meta.env.VITE_API_BASE  

export default function Home(){
 
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  //Fetch featured services(from Neo4j)
  useEffect(() => {
    const fetchFeatured =async () => {
      try{
        const res = await fetch(`${API}/services?limit=3`)
        const json = await res.json()
        if(!res.ok)throw new Error(json.error || `HTTP ${res.status}`)
        setFeatured((json.rows || json.data || json).slice(0, 3));

      }catch(e){
        setError(e.message)
      }
    }
    fetchFeatured()
  },[])
  return (
    <main className="home-container">
      {/*HERO SECTION*/}
      <section className="hero">
        <div className="hero-content">
          <h1> Velkommen til Helse og Omsorg"
         </h1>
          <p>
            Vi jobber for å gi innbyggere i kommunen trygge og tilgjengelige helse-og omsorgtjenster.
            Her finner du informasjon om våre tilbud og hvordan du kan få hjelp
          </p>
          <Link to = "/services" className="cta-button">Se mer tjenester →</Link>
        </div>
        <div className="hero-image"></div>  
      </section>
      

      {/*Thematic cards*/}

<section className="info-section">
  <h2>Finn hjelp og støtte</h2>
  <div className="info-grid">
    <div className="info-card">
      <h3>🏥 Tjenester for eldre</h3>
      <p>Informasjon om hjemmehjelp, sykehjemplass,og støtteordninger for eldre. </p>
      <Link to ="/services" className="info-link">Les mer → </Link>
    </div>

    <div className="info-card">
      <h3>👩‍👧 Barne- og familieomsorg</h3>
      <p>Støtte til familier, barnevern, og tiltak for et trygt oppveksmiljø</p>
      <Link to = "/services" className="info-link">Se tjenester →</Link>
    </div>

    <div className="info-card">
      <h3>💚 Psykisk helse og rus</h3>
      <p>Få hjelp, råd og oppfølging innen psykisk helse og rusomsorg</p>
      <Link to="/services" className="info-link">   Les mer →</Link>
    </div>
  </div>
</section>


   {/*ABOUT SECTION*/}
   <section className="about-section">
    <h2>Om oss</h2>
    <p>
      Helse og omsorgavdelingen jobber for å fremme helse, trygghet og trivsel i kommunen.
      Vi samarbeider med innbyggere, pårørende og fagmiljøer for å skape gode tjenster for alle
    </p>
   </section>
    </main>
  )
}