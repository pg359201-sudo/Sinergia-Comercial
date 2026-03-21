import express from "express";
import { createServer as createViteServer } from "vite";
import { sql } from "@vercel/postgres";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware para procesar JSON (con límite ampliado para archivos grandes)
  app.use(express.json({ limit: '50mb' }));

  // --- RUTAS DE LA API ---

  // 1. Health check y estado de la BD
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      postgresConfigured: !!process.env.POSTGRES_URL 
    });
  });

  // 2. Inicializar la Base de Datos (Crear tablas)
  app.post("/api/init-db", async (req, res) => {
    if (!process.env.POSTGRES_URL) {
      return res.status(500).json({ error: "POSTGRES_URL no está configurada en las variables de entorno." });
    }
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS clients (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          address VARCHAR(255),
          route VARCHAR(255),
          visit_day VARCHAR(50),
          channel VARCHAR(100),
          gec VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      res.json({ message: "Tablas creadas exitosamente en Postgres" });
    } catch (error) {
      console.error("Error inicializando la BD:", error);
      res.status(500).json({ error: "Error al crear las tablas" });
    }
  });

  // 3. Obtener todos los clientes
  app.get("/api/clients", async (req, res) => {
    if (!process.env.POSTGRES_URL) {
      return res.json([]); // Si no hay BD, devuelve array vacío para no romper la app
    }
    try {
      const { rows } = await sql`SELECT * FROM clients ORDER BY created_at DESC`;
      res.json(rows);
    } catch (error) {
      console.error("Error obteniendo clientes:", error);
      res.status(500).json({ error: "Error al obtener clientes de Postgres" });
    }
  });

  // 4. Insertar clientes masivamente (desde Excel)
  app.post("/api/clients/bulk", async (req, res) => {
    if (!process.env.POSTGRES_URL) {
      return res.status(500).json({ error: "POSTGRES_URL no está configurada." });
    }
    try {
      const clients = req.body.clients;
      if (!Array.isArray(clients)) {
        return res.status(400).json({ error: "Formato de datos inválido" });
      }

      let inserted = 0;
      for (const c of clients) {
        try {
          await sql`
            INSERT INTO clients (id, name, address, route, visit_day, channel, gec)
            VALUES (${c.id}, ${c.name}, ${c.address}, ${c.route}, ${c.visitDay}, ${c.channel}, ${c.gec})
            ON CONFLICT (id) DO NOTHING;
          `;
          inserted++;
        } catch (err) {
          console.error(`Error insertando cliente ${c.name}:`, err);
        }
      }
      res.json({ message: `Se insertaron ${inserted} clientes en Postgres` });
    } catch (error) {
      console.error("Error en bulk insert:", error);
      res.status(500).json({ error: "Error al guardar clientes en Postgres" });
    }
  });

  // --- INTEGRACIÓN CON VITE (Frontend) ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
