import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import fs from "fs";

const app = express();
const PORT = 3000;

// Database setup
const db = new Database("database.sqlite");

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    description TEXT,
    concept TEXT
  );

  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id INTEGER,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES models(id)
  );
`);

// Seed initial models if empty
const count = db.prepare("SELECT COUNT(*) as count FROM models").get() as { count: number };
const initialModels = [
  { 
    name: "Ari Espinoza", 
    description: "Es una modelo de belleza física excepcional y estilo peculiar, enfocada en shows sexuales explícitos de alto impacto, dominando categorías intensas como anal, garganta profunda, fetiche de pies y sexo en general.",
    concept: "Dominación intensa y fetiche de pies"
  },
  { 
    name: "Jeimi Escobar", 
    description: "Es una atractiva modelo madura (MILF) de gran elegancia, especializada en fetiches de humillación (Cornudo/Cuckold) combinados con la adoración sofisticada de sus pies, medias y tacones.",
    concept: "Humillación sofisticada (Cuckold) y adoración de pies"
  },
  { 
    name: "Liliana Delgado", 
    description: "Es una modelo Teen BBW de rostro muy bello, con una oferta versátil que combina shows enfocados en sus senos y blowjobs, junto con una fuerte línea de fetiches de dominación y sumisión (Kinky, Sissy, Cornudo y Pies).",
    concept: "Versatilidad BBW: Senos, Blowjobs y Dominación Kinky"
  },
  { 
    name: "Natalia Novoa", 
    description: "Es una mujer que irradia sofisticación y glamour, destacando con una estética sumamente elegante y de alta gama para nichos de exclusividad y adoración VIP (Medias, Tacones y Diosa).",
    concept: "Elegancia de alta gama: Diosa en medias y tacones"
  },
  {
    name: "Lorena Lopez",
    description: "Modelo Curvy muy experimentada y flexible que contrasta un look tierno e intelectual con shows de altísima intensidad, destacando sus senos grandes, el uso magistral de la fuckmachine y el contenido sexual de calidad, se identifican patrones de anal, blowjob, deepthroat y fetiches; como contenido exclusivo.",
    concept: "Contraste intelectual y shows de alta intensidad con fuckmachine"
  },
  {
    name: "Valentina Botia",
    description: "Modelo de curvas impactantes que monetiza nichos explícitos de altísimo valor (anal y exclusividad de lactancia), complementando su intensa oferta con fetiche de pies, blowjob y juegos de roles.",
    concept: "Monetización de nichos explícitos de alto valor (Anal, Lactancia y Fetiches)"
  }
];

const insert = db.prepare("INSERT OR IGNORE INTO models (name, description, concept) VALUES (?, ?, ?)");
const update = db.prepare("UPDATE models SET description = ?, concept = ? WHERE name = ?");

initialModels.forEach(m => {
  insert.run(m.name, m.description, m.concept);
  update.run(m.description, m.concept, m.name);
});

// Fix typo if database already exists
db.prepare("UPDATE models SET name = 'Jeimi Escobar' WHERE name = 'Jeini Escobar'").run();

app.use(express.json());

// API Routes
app.get("/api/models", (req, res) => {
  const models = db.prepare("SELECT * FROM models").all();
  res.json(models);
});

app.post("/api/models", (req, res) => {
  const { name, description, concept } = req.body;
  const upsert = db.prepare(`
    INSERT INTO models (name, description, concept) 
    VALUES (?, ?, ?) 
    ON CONFLICT(name) DO UPDATE SET 
      description = excluded.description,
      concept = excluded.concept
  `);
  upsert.run(name, description, concept);
  res.json({ success: true });
});

app.get("/api/history/:modelId", (req, res) => {
  const history = db.prepare("SELECT content FROM history WHERE model_id = ? ORDER BY created_at DESC LIMIT 10").all(req.params.modelId);
  res.json(history.map((h: any) => JSON.parse(h.content)));
});

app.post("/api/history", (req, res) => {
  const { modelId, content } = req.body;
  const insert = db.prepare("INSERT INTO history (model_id, content) VALUES (?, ?)");
  insert.run(modelId, JSON.stringify(content));
  res.json({ success: true });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
