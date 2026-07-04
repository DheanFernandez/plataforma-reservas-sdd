import sql from "mssql";

const config: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_DATABASE,
  options: {
    instanceName: process.env.DB_INSTANCE,
    encrypt: false,
    trustServerCertificate: true,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getConnection() {
  try {
    console.log("Intentando conectar con SQL Server usando usuario SQL:");
    console.log({
      server: process.env.DB_SERVER,
      instance: process.env.DB_INSTANCE,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
    });

    if (pool) {
      return pool;
    }

    pool = await sql.connect(config);
    return pool;
  } catch (error) {
    console.error("Error de conexión a SQL Server:", error);
    throw error;
  }
}

export { sql };