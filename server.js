import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { DateTime } from 'luxon';  // npm install luxon

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// ✅ Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, 'public')));

// 🟠 Listar reuniões
app.get('/meetings', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        title, 
        "start", 
        "end", 
        roomid AS "roomId"
      FROM meetings
      ORDER BY "start"
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar reuniões:', error);
    res.status(500).send('Erro ao buscar reuniões');
  }
});

// 🟢 Adicionar reunião com ajuste de fuso
app.post('/api/meetings', async (req, res) => {
  let { title, start, end, roomId } = req.body;

  // Ajuste para fuso horário do Brasil
  start = DateTime.fromISO(start, { zone: 'America/Sao_Paulo' }).toUTC().toISO();
  end = DateTime.fromISO(end, { zone: 'America/Sao_Paulo' }).toUTC().toISO();

  try {
    await pool.query(
      'INSERT INTO meetings (title, "start", "end", roomid) VALUES ($1, $2, $3, $4)',
      [title, start, end, roomId]
    );
    res.status(201).send({ message: 'Reunião criada com sucesso!' });
  } catch (error) {
    console.error('Erro ao adicionar reunião:', error);
    res.status(500).send('Erro ao adicionar reunião');
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});
