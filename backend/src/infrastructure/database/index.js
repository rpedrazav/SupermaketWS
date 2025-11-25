import pkg from 'pg';
const { Pool } = pkg;
import config from '../config/index.js';

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: config.database.connectionString,
  max: config.database.max,
  idleTimeoutMillis: config.database.idleTimeoutMillis,
  connectionTimeoutMillis: config.database.connectionTimeoutMillis,
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test database connection
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✓ Database connected successfully');
    const result = await client.query('SELECT NOW()');
    console.log('✓ Database time:', result.rows[0].now);
    client.release();
    return true;
  } catch (err) {
    console.error('✗ Database connection error:', err.message);
    return false;
  }
};

// Query helper
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (config.nodeEnv === 'development') {
      console.log('Executed query', { text, duration, rows: result.rowCount });
    }
    
    return result;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
};

// Transaction helper
export const withTransaction = async (callback) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Close pool
export const closePool = async () => {
  await pool.end();
  console.log('Database pool closed');
};

export default pool;
