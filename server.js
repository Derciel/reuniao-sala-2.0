import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rota para listar reuniões
app.get('/meetings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM meetings ORDER BY start');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar reuniões:', error);
    res.status(500).send('Erro ao buscar reuniões');
  }
});

// Rota para adicionar reunião
app.post('/', async (req, res) => {
  const { title, start, end, roomId } = req.body;
  try {
    await pool.query(
      'INSERT INTO meetings (title, start, end, roomId) VALUES ($1, $2, $3, $4)',
      [title, start, end, roomId]
    );
    res.status(201).send({ message: 'Reunião criada com sucesso!' });
  } catch (error) {
    console.error('Erro ao adicionar reunião:', error);
    res.status(500).send('Erro ao adicionar reunião');
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
