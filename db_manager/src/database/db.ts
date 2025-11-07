import oracledb from "oracledb";

const dbConfig = {
  user: "BD040825126",
  password: "Osmyk3",
  connectString: "BD-ACD:1521/xe"
};


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

async function close() {
  try {
    await oracledb.getPool().close(10);
    console.log('Connection pool closed');
  } catch (err) {
    console.error('Error closing connection pool:', err);
  }
}

function getConnection() {
  return oracledb.getConnection();
}

export { initialize, close, getConnection };
