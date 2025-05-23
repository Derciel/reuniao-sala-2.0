import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { DateTime } from 'luxon';  // npm install luxon
import { getGraphClient } from './graphClient.js';

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
app.post('/api/meetings', async (req, res) => {
  let { title, start, end, roomId } = req.body;

  start = DateTime.fromISO(start, { zone: 'America/Sao_Paulo' }).toUTC().toISO();
  end = DateTime.fromISO(end, { zone: 'America/Sao_Paulo' }).toUTC().toISO();

  try {
    const client = await getGraphClient();

    // Criar reunião online no Teams
    const onlineMeeting = await client.api('/me/onlineMeetings')
      .post({
        subject: title,
        startDateTime: start,
        endDateTime: end,
      });

    const joinUrl = onlineMeeting.joinWebUrl;

    // Salvar reunião com URL do Teams
    await pool.query(
      'INSERT INTO meetings (title, "start", "end", roomid, join_url) VALUES ($1, $2, $3, $4, $5)',
      [title, start, end, roomId, joinUrl]
    );

    res.status(201).send({ message: 'Reunião criada com sucesso!', joinUrl });
  } catch (error) {
    console.error('Erro ao adicionar reunião:', error);
    res.status(500).send('Erro ao adicionar reunião');
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
