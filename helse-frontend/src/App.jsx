import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./styles/App.css"
import "./components/ServiceInfo"
import ServiceInfo from "./components/ServiceInfo";
import { useState } from "react";

export default function App() {
  const [lang, setLang] = useState("no")
  const toggleLang = (newLang) =>{
    setLang(newLang)
  }
  return (
    <>
    <Header lang={lang} onLangChange={toggleLang} />
    <main className="main-content">
      <Outlet context={{lang}} />
    </main>
    <Footer lang ={lang}/>
    <ServiceInfo />
  </>
);
}
