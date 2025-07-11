import express from "express";
import cors from "cors";
import pool from './database/db.js';

import eventRoutes from "./src/modules/event-routes.js";
 
const app = express();
const port = 3000;

app.use(express.json()); 
app.use("/api", eventRoutes);

//Verificar la conexión a pgadmin
app.get("/api/test-db", async (req, res) => {
    try {
      const result = await pool.query("SELECT NOW()");
      res.json({ connected: true, time: result.rows[0].now });
    } catch (err) {
      console.error("Error de conexión a PostgreSQL:", err);
      res.status(500).json({ connected: false, error: err.message });
    }
  });

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
})