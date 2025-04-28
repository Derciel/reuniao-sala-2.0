import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('🟢 Conexão com o banco funcionando!');
    console.log('Data e hora do banco:', result.rows[0]);
    process.exit(0); // Finaliza o processo com sucesso
  } catch (error) {
    console.error('❌ Erro na conexão com o banco de dados:', error.message);
    process.exit(1); // Finaliza com erro
  }
}

testConnection();
