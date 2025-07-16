import express from 'express';
import dotenv from 'dotenv';
import eventRoutes from './src/modules/event-routes.js';
import pool from './database/db.js'
import userRoutes from "./src/modules/user-routes.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api', eventRoutes);
app.use("/api", userRoutes);

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


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
