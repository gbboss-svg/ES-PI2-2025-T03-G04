import oracledb from "oracledb";

const dbConfig = {
  user: "GABRIEL",
  password: "Gb122100189",
  connectString: "localhost:1521/XEPDB1"
};

/**
 * Inicializa o pool de conexões com o banco de dados Oracle.
 */
async function initialize() {
  try {
    await oracledb.createPool({
      ...dbConfig,
      poolAlias: 'default',
      poolIncrement: 1,
      poolMin: 4,
      poolMax: 10,
    });
    console.log('Connection pool started');
  } catch (err) {
    console.error('Error creating connection pool:', err);
    process.exit(1);
  }
}

/**
 * Fecha o pool de conexões de forma graciosa.
 */
async function close() {
  try {
    await oracledb.getPool().close(10);
    console.log('Connection pool closed');
  } catch (err) {
    console.error('Error closing connection pool:', err);
  }
}

/**
 * Obtém uma única conexão do pool.
 */
function getConnection() {
  return oracledb.getConnection();
}

export { initialize, close, getConnection };