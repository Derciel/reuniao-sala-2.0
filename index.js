import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { DateTime } from 'luxon';

import { pool } from './db.js';
import { getGraphClient } from './graphClient.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/meetings', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, "start", "end", roomid AS "roomId", join_url AS "joinUrl"
      FROM meetings
      ORDER BY "start"
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar reuniões:', err);
    res.status(500).send('Erro ao buscar reuniões');
  }
});

app.post('/api/meetings', async (req, res) => {
  let { title, start, end, roomId } = req.body;

  start = DateTime.fromISO(start, { zone: 'America/Sao_Paulo' }).toUTC().toISO();
  end = DateTime.fromISO(end, { zone: 'America/Sao_Paulo' }).toUTC().toISO();

  try {
    const client = await getGraphClient();

    const userId = process.env.GRAPH_USER_ID;

    const onlineMeeting = await client
      .api(`/users/${userId}/onlineMeetings`)
      .post({
        subject: title,
        startDateTime: start,
        endDateTime: end,
      });

    const joinUrl = onlineMeeting.joinWebUrl;

    await pool.query(
      `INSERT INTO meetings (title, "start", "end", roomid, join_url)
       VALUES ($1, $2, $3, $4, $5)`,
      [title, start, end, roomId, joinUrl]
    );

    res.status(201).send({ message: 'Reunião criada com sucesso!', joinUrl });
  } catch (err) {
    console.error('Erro ao adicionar reunião:', err);
    res.status(500).send('Erro ao adicionar reunião');
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});
