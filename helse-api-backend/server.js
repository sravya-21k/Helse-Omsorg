import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import neo4j from 'neo4j-driver';


const app = express();
app.use(cors({
  origin: [/^http:\/\/localhost:(5173|3000)$/],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
}));


// ===== CONFIG =====
const NEO4J_URI = process.env.NEO4J_URI ;
const NEO4J_USER = process.env.NEO4J_USER ;
const NEO4J_PASS = process.env.NEO4J_PASS;

const NEO4J_DB   = process.env.NEO4J_DB   || 'neo4j';
const PORT       = process.env.PORT       || 4000;

// Driver (plain bolt:// → encryption off)
const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASS),
  { encrypted: 'ENCRYPTION_OFF',
disableLosslessIntegers: true } // easier to work with JS numbers
);

//Route1: list services

app.get('/api/services',async(req,res)=>{
    const session = driver.session()
    try{
      const q = String(req.query.q ?? '').trim()
      const isNum = /^\d+$/.test(q)
      const skip = Math.max(0,Number(req.query.skip ?? 0))
      const limit = Math.max(1, Math.min(100, Number(req.query.limit ?? 20)))
      const sort = (req.query.sort ?? 'navn').toLowerCase();
      const order = (req.query.order ?? 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC'

      //common subquery to produce candiate leaf nodes as 'n'
        const cypher = ` 
        MATCH (s) WHERE id(s) IN [232,236]
        MATCH (s)-[*1..6]-(n)
        WITH id(s) AS sid, collect(DISTINCT n) AS nodes
        UNWIND nodes AS n
        MATCH (n)-[*1..1]-(m) WHERE m IN nodes
        WITH sid, n, count(DISTINCT m) AS deg
        WHERE deg = 1 AND id(n) <> sid
        WITH n ,$q AS q , $isNum AS isNum
        //filter by name or id
        WHERE q = '' OR toLower(coalesce(n.navn, n.name, '')) CONTAINS toLower($q)
                     OR (isNum AND id(n) = toInteger(q))
                     OR (NOT isNum AND toString(id(n)) CONTAINS q)
      `;

        //total
        const totalRes = await session.run(
          `${cypher} RETURN count(n) AS total`,{q, isNum})
        const total = Number(totalRes.records[0].get('total'))

        //page
        //dynamic order by
        const orderBy = 
        sort === 'id' ? `ORDER BY id(n) ${order}` : `ORDER BY coalesce(n.navn, n.name) ${order}`

    const pageRes = await session.run(
      `${cypher}
      ${orderBy}
      SKIP toInteger($skip)
      LIMIT toInteger($limit)
      RETURN {id:id(n), navn:coalesce(n.navn, n.name)} AS item`,
      {q,isNum, skip, limit}
    );
    const items = pageRes.records.map(r => r.get('item'))
    return res.json({items, total, skip, limit})
  
      } catch (e) {
       if(!res.headersSent) res.status(500).json({ error: e.message });
      } finally {
        await session.close();
      }
    });

//Route 2:detail of one service
// Route 2: detail of one service by internal Neo4j id
app.get('/api/services/:id', async (req, res) => {
  const id = Number(req.params.id);
  const session = driver.session();
  try {
    const cy = `
    MATCH (e) WHERE id(e) = $id
    OPTIONAL MATCH (e)-[r]-(n)
    WITH e,
         collect(DISTINCT
           CASE WHEN n IS NULL THEN NULL ELSE {
             id: id(n),
             navn: coalesce(n.navn, n.name),
             labels: labels(n),
             relType: type(r),
             dir: CASE WHEN startNode(r)=e THEN 'out' ELSE 'in' END
           } END
         ) AS relasjoner
    WITH e, [x IN relasjoner WHERE x IS NOT NULL] AS relasjoner
    RETURN {
      id: id(e),
      navn: coalesce(e.navn, e.name),
      kontaktperson: e.kontaktperson,
      superbruker: e.superbruker,
      supporttelefon: e.supporttelefon,
      supportepost: e.supportepost,
      telefon: e.telefon,
      epost: e.epost,
      adresse: e.adresse,
      relasjoner: relasjoner
    } AS detail
    
    `;
    const r = await session.run(cy, { id });
    if (r.records.length === 0)
      return res.status(404).json({ error: "Service not found" });
    res.json(r.records[0].get("detail"));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  } finally {
    await session.close();
  }
});

  //realtions neighbors of a node with rel type +director

  app.get('/api/services/:id/relations',async(req, res) => {
    const session = driver.session()
    try{
      const id = Number(req.params.id)
      if(Number.isNaN(id)) return res.status(400).json({error:'Bad id'})
      const cypher = `
        MATCH (e) WHERE id(e) = $id
OPTIONAL MATCH (e)-[r]-(n)
RETURN {
  id: id(n),
  navn: coalesce(n.navn, n.name),
  labels: labels(n),
  relType: type(r),
  dir: CASE WHEN startNode(r)=e THEN 'out' ELSE 'in' END
} AS rel
ORDER BY rel.navn
      `
          const r = await session.run(cypher, {id})
          const rows = r.records.map(x => x.get('rel'))
         return res.json(rows)

    }catch(e){
    if(!res.headersSent) res.status(500).json({error:e.message})
    }finally{
      await session.close()
    }
  })

  //Top services(most connected)

  app.get('/api/top-services', async (req, res) =>{
    const session = driver.session()
    try{
      const result  = await session.run(`
      MATCH (t:Tjeneste) - [r]-()
      WITH t, count(r) AS deg
      RETURN {id:id(t), navn:coalesce(t.navn,t.name),deg:deg } AS s
      ORDER BY s.deg DESC LIMIT 10
      `)
      const data = result.records.map(r => r.get('s'))
      res.json(data)
    }catch(e){
      console.error("Error fetching top services:",e)
      res.status(500).json({error:e.message})
    }finally{
      await session.close()
    }
  })
  
//GET/api/services/:id/navigation
//Finds short path frpm the current node to a "root-like" node by labels
app.get('/api/services/:id/navigation',async(req,res)=>{
  const id= Number(req.params.id)
  const session = driver.session()

    // Load root labels from .env (with fallback)
    const ROOT_LABELS = process.env.ROOT_LABELS 
    .split(",")
    .map(s => s.trim());
  try{
    const cy = `
    MATCH (e) WHERE id(e) = $id
    // find a short path up to a "root-like" node (any of the labels)
    MATCH p = (e)-[*1..6]-(root)
    WHERE any(l IN labels(root) WHERE l IN $ROOT_LABELS)
    WITH e, p, length(p) AS len
    ORDER BY len ASC
    LIMIT 1
    WITH e, nodes(p) AS ns
    // make sure the order goes from root → child
    WITH e,CASE WHEN head(ns) = e THEN reverse(ns) ELSE ns END AS ordered
    RETURN [n IN ordered | { 
      id:id(n), 
      navn:coalesce(n.navn,n.name), 
      labels:labels(n) 
    }] AS trail
    `;
    const result = await session.run(cy, {id, ROOT_LABELS})
    const trail = result.records[0]?.get("trail") ?? []

    //if no path found just return the node itself

    if(trail.length === 0){
      const self = await session.run(
        `MATCH (e)  WHERE id(e)=$id RETURN {id:id(e), navn:coalesce(e.navn, e.name), labels:labels(e)} AS node`,{id}
      )
      const node = self.records[0]?.get("node")
      return res.json(node ? [node] : [])
    }
    res.json(trail)
  }catch(error){
    console.error("navaigation query failed", error)
    res.status(500).json({error:error.message})
  }    finally{
    await session.close()
  }
    })


app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    try {
      const session = driver.session({database: NEO4J_DB});
      await session.run('RETURN 1');
      await session.close();
      console.log('✅ Connected to Neo4j');
    } catch (e) {
      console.error('❌ Neo4j connection error:', e.message);
    }
    });
    
  
  process.on('SIGINT', async () => {
    await driver.close();
    process.exit(0);
  });