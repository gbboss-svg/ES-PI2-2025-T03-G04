import oracledb from "oracledb";
export async function getConnection() {
  return await oracledb.getConnection({
    user: "BD040825126",
    password: "Osmyk3",
    connectString: "BD-ACD:1521/xe" 
  });
}
