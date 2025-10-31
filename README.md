## Helse og Omsorg - Frontend Utvikling
## Formål
Dette prosjektet er laget for å utvikle et **brukevennlig og responsivt nettsted** som viser kommunale *Helse-og-omsorgtjenster**.
Nettet kobles mot end **Neo4j grafdatabase** og viser tjenster, egenskaper og relasjoner mellom dem.

## Teknologier brukt
**Frontend:** React(vite), HTML, CSS, javascript
**Backend:** Node.js / Express.js
**Database:** Neo4j(grafdatamodell)
**Andre verktøy :** React Router, miljøvariable(.env)


## Hovedfunksjoner
-viser tjenster innen *Helse og omsorg* hentet fra databasen
-Viser relasjoner (realterte tjenster)
-Responsive design for mobil, nettbrett og PC
-Søkefunksjon og paginering for enklere navigasjon
-Header og footer med kontaktinformasjon
-Klart grensenitt for fremtidige attributer som support telefon, epost, kontaktperson

## Hvordan det fungerer
**Backend(Express)** kobles til Neo4j-databasen og leverer data via REST API.
**Frontend(React)** henter og viser data dynamsik
 
 ## Responsivt design
 Nettsiden er laget med **css Grid** og  **Flexbox** for å fungere godt på alle skjermtørrelser

 # videre arbeid
 -Legge til flere attributer som supportinformasjon og besrivelse
 -Språkvalg (norsk/engelsk)
 -Forbedre design og legge til ikoner
 -Utvide funksjonalitet når mer data blir tilgjengelig i Neo4j

# Helse og Omsorg - Backend(Express + Neo4j)
 ## Formål
 Backend delen håndterer kommunikasjonen mellom --frontend ** og  **Neo4j-databsen.
 Den leverer tjenstedata, relasjoner og detaljer via at REST API.

 ## Teknologier brukt
 -**Runtime:** Node.js
 -**Framwork:** Express.js
 -**Database:** Neo4j
 -**Miljøvariabler.**:dotenv
 -**CORS & body-parser** For API-tilkobling

 ## Hvordan kjøre hele prosjektet
 ## Backend
 1. Gå til `helse-api-backend/`
 2. kjør `npm install`
 3. Start med `npm start` 

 ### Frontend
1. Gå til `helse-frontend/`
2. Kjør `npm install`
3. Start med `npm run dev`
4. Åpne [http://localhost:5173](http://localhost:5173)
