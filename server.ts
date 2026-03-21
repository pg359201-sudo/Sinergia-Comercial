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
      await sql`
        CREATE TABLE IF NOT EXISTS missions (
          id VARCHAR(255) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          client_id VARCHAR(255),
          assigned_to VARCHAR(255),
          created_by VARCHAR(255),
          status VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP,
          evidence_url TEXT,
          notes TEXT
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS alerts (
          id VARCHAR(255) PRIMARY KEY,
          type VARCHAR(50),
          description TEXT,
          client_id VARCHAR(255),
          created_by VARCHAR(255),
          status VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS sales (
          id VARCHAR(255) PRIMARY KEY,
          client_id VARCHAR(255),
          created_by VARCHAR(255),
          product VARCHAR(255),
          quantity INTEGER,
          amount INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS activations (
          id VARCHAR(255) PRIMARY KEY,
          title VARCHAR(255),
          description TEXT,
          client_id VARCHAR(255),
          created_by VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          evidence_url TEXT
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

  // --- MISSIONS ---
  app.get("/api/missions", async (req, res) => {
    if (!process.env.POSTGRES_URL) return res.json([]);
    try {
      const { rows } = await sql`SELECT * FROM missions ORDER BY created_at DESC`;
      res.json(rows.map(r => ({
        id: r.id, title: r.title, description: r.description, clientId: r.client_id,
        assignedTo: r.assigned_to, createdBy: r.created_by, status: r.status,
        createdAt: r.created_at, completedAt: r.completed_at, evidenceUrl: r.evidence_url, notes: r.notes
      })));
    } catch (error) { res.status(500).json({ error: "Error obteniendo misiones" }); }
  });

  app.post("/api/missions", async (req, res) => {
    if (!process.env.POSTGRES_URL) return res.status(500).json({ error: "DB no configurada" });
    try {
      const { id, title, description, clientId, assignedTo, createdBy, status, createdAt, evidenceUrl, notes } = req.body;
      await sql`
        INSERT INTO missions (id, title, description, client_id, assigned_to, created_by, status, created_at, evidence_url, notes)
        VALUES (${id}, ${title}, ${description}, ${clientId}, ${assignedTo}, ${createdBy}, ${status}, ${createdAt}, ${evidenceUrl || null}, ${notes || null})
      `;
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error creando misión" }); }
  });

  app.put("/api/missions/:id", async (req, res) => {
    if (!process.env.POSTGRES_URL) return res.status(500).json({ error: "DB no configurada" });
    try {
      const { status, evidenceUrl, notes, completedAt } = req.body;
      await sql`
        UPDATE missions 
        SET status = ${status}, evidence_url = ${evidenceUrl || null}, notes = ${notes || null}, completed_at = ${completedAt || null}
        WHERE id = ${req.params.id}
      `;
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error actualizando misión" }); }
  });

  app.delete("/api/missions", async (req, res) => {
    if (!process.env.POSTGRES_URL) return res.status(500).json({ error: "DB no configurada" });
    try {
      const { ids } = req.body;
      if (ids && ids.length > 0) {
        await sql`DELETE FROM missions WHERE id = ANY(${ids})`;
      }
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error eliminando misiones" }); }
  });

  // --- ALERTS ---
  app.get("/api/alerts", async (req, res) => {
    if (!process.env.POSTGRES_URL) return res.json([]);
    try {
      const { rows } = await sql`SELECT * FROM alerts ORDER BY created_at DESC`;
      res.json(rows.map(r => ({
        id: r.id, type: r.type, description: r.description, clientId: r.client_id,
        createdBy: r.created_by, status: r.status, createdAt: r.created_at
      })));
    } catch (error) { res.status(500).json({ error: "Error obteniendo alertas" }); }
  });

  app.post("/api/alerts", async (req, res) => {
    if (!process.env.POSTGRES_URL) return res.status(500).json({ error: "DB no configurada" });
    try {
      const { id, type, description, clientId, createdBy, status, createdAt } = req.body;
      await sql`
        INSERT INTO alerts (id, type, description, client_id, created_by, status, created_at)
        VALUES (${id}, ${type}, ${description}, ${clientId}, ${createdBy}, ${status}, ${createdAt})
      `;
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error creando alerta" }); }
  });

  app.put("/api/alerts/:id", async (req, res) => {
    if (!process.env.POSTGRES_URL) return res.status(500).json({ error: "DB no configurada" });
    try {
      const { status } = req.body;
      await sql`UPDATE alerts SET status = ${status} WHERE id = ${req.params.id}`;
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error actualizando alerta" }); }
  });

  app.delete("/api/alerts", async (req, res) => {
    if (!process.env.POSTGRES_URL) return res.status(500).json({ error: "DB no configurada" });
    try {
      const { ids } = req.body;
      if (ids && ids.length > 0) {
        await sql`DELETE FROM alerts WHERE id = ANY(${ids})`;
      }
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error eliminando alertas" }); }
  });

  // --- SALES ---
  app.get("/api/sales", async (req, res) => {
    if (!process.env.POSTGRES_URL) return res.json([]);
    try {
      const { rows } = await sql`SELECT * FROM sales ORDER BY created_at DESC`;
      res.json(rows.map(r => ({
        id: r.id, clientId: r.client_id, createdBy: r.created_by,
        product: r.product, quantity: r.quantity, amount: r.amount, createdAt: r.created_at
      })));
    } catch (error) { res.status(500).json({ error: "Error obteniendo ventas" }); }
  });

  app.post("/api/sales", async (req, res) => {
    if (!process.env.POSTGRES_URL) return res.status(500).json({ error: "DB no configurada" });
    try {
      const { id, clientId, createdBy, product, quantity, amount, createdAt } = req.body;
      await sql`
        INSERT INTO sales (id, client_id, created_by, product, quantity, amount, created_at)
        VALUES (${id}, ${clientId}, ${createdBy}, ${product}, ${quantity}, ${amount}, ${createdAt})
      `;
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error creando venta" }); }
  });

  app.delete("/api/sales", async (req, res) => {
    if (!process.env.POSTGRES_URL) return res.status(500).json({ error: "DB no configurada" });
    try {
      const { ids } = req.body;
      if (ids && ids.length > 0) {
        await sql`DELETE FROM sales WHERE id = ANY(${ids})`;
      }
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error eliminando ventas" }); }
  });

  // --- ACTIVATIONS ---
  app.get("/api/activations", async (req, res) => {
    if (!process.env.POSTGRES_URL) return res.json([]);
    try {
      const { rows } = await sql`SELECT * FROM activations ORDER BY created_at DESC`;
      res.json(rows.map(r => ({
        id: r.id, title: r.title, description: r.description, clientId: r.client_id,
        createdBy: r.created_by, createdAt: r.created_at, evidenceUrl: r.evidence_url
      })));
    } catch (error) { res.status(500).json({ error: "Error obteniendo activaciones" }); }
  });

  app.post("/api/activations", async (req, res) => {
    if (!process.env.POSTGRES_URL) return res.status(500).json({ error: "DB no configurada" });
    try {
      const { id, title, description, clientId, createdBy, createdAt, evidenceUrl } = req.body;
      await sql`
        INSERT INTO activations (id, title, description, client_id, created_by, created_at, evidence_url)
        VALUES (${id}, ${title}, ${description}, ${clientId}, ${createdBy}, ${createdAt}, ${evidenceUrl})
      `;
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error creando activación" }); }
  });

  app.delete("/api/activations", async (req, res) => {
    if (!process.env.POSTGRES_URL) return res.status(500).json({ error: "DB no configurada" });
    try {
      const { ids } = req.body;
      if (ids && ids.length > 0) {
        await sql`DELETE FROM activations WHERE id = ANY(${ids})`;
      }
      res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Error eliminando activaciones" }); }
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
