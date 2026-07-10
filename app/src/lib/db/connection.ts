import sql from "mssql";

const isAzure = process.env.DB_PROVIDER === "azure";

const server = process.env.DB_SERVER || "localhost";
const database = process.env.DB_DATABASE;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

if (!database) {
  throw new Error("Falta la variable de entorno DB_DATABASE.");
}

if (!user) {
  throw new Error("Falta la variable de entorno DB_USER.");
}

if (!password) {
  throw new Error("Falta la variable de entorno DB_PASSWORD.");
}

const config: sql.config = {
  user,
  password,
  server,
  database,

  // Azure SQL utiliza normalmente el puerto 1433.
  port: process.env.DB_PORT
    ? Number(process.env.DB_PORT)
    : 1433,

  options: {
    // La instancia solo se utiliza con SQL Server local.
    ...(isAzure
      ? {}
      : {
          instanceName:
            process.env.DB_INSTANCE || "MSSQLSERVER2022",
        }),

    // Azure requiere conexión cifrada.
    encrypt: isAzure
      ? true
      : process.env.DB_ENCRYPT === "true",

    // En local se acepta el certificado de la instancia.
    // En Azure debe mantenerse en false.
    trustServerCertificate: isAzure
      ? false
      : process.env.DB_TRUST_CERT !== "false",
  },

  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },

  connectionTimeout: 30000,
  requestTimeout: 30000,
};

let pool: sql.ConnectionPool | null = null;
let poolPromise: Promise<sql.ConnectionPool> | null = null;

export async function getConnection(): Promise<sql.ConnectionPool> {
  try {
    if (pool?.connected) {
      return pool;
    }

    if (poolPromise) {
      return poolPromise;
    }

    console.log("Intentando conectar con SQL Server:", {
      provider: isAzure ? "azure" : "local",
      server,
      instance: isAzure
        ? "No aplica"
        : process.env.DB_INSTANCE,
      database,
      user,
      port: config.port,
      encrypt: config.options?.encrypt,
    });

    pool = new sql.ConnectionPool(config);

    pool.on("error", (error) => {
      console.error(
        "Error en el pool de conexión de SQL Server:",
        error
      );

      pool = null;
      poolPromise = null;
    });

    poolPromise = pool.connect();

    const connectedPool = await poolPromise;

    console.log(
      `Conexión exitosa a SQL Server (${isAzure ? "Azure" : "local"}).`
    );

    return connectedPool;
  } catch (error) {
    pool = null;
    poolPromise = null;

    console.error(
      "Error de conexión a SQL Server:",
      error
    );

    throw error;
  }
}

export { sql };