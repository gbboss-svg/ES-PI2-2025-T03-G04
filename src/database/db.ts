import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '495321',
  database: 'BD_MANEGER_ALL',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
