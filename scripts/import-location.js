const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { Pool, neonConfig } = require("@neondatabase/serverless");
const { PrismaNeon } = require("@prisma/adapter-neon");

const loadEnvFile = (filename) => {
  const filePath = path.resolve(process.cwd(), filename);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) return;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
};

loadEnvFile(".env.local");
loadEnvFile(".env");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Add it to .env.local.");
}

let dbHost = "unknown";
let dbName = "unknown";
try {
  const parsedUrl = new URL(process.env.DATABASE_URL);
  dbHost = parsedUrl.host;
  dbName = parsedUrl.pathname.replace("/", "") || "unknown";
} catch (error) {
  throw new Error("DATABASE_URL is not a valid URL.");
}

console.log(`Connecting to database host: ${dbHost}, database: ${dbName}`);

const parsedUrl = new URL(process.env.DATABASE_URL);
process.env.PGHOST = parsedUrl.hostname;
process.env.PGPORT = parsedUrl.port || "5432";
process.env.PGUSER = decodeURIComponent(parsedUrl.username);
process.env.PGPASSWORD = decodeURIComponent(parsedUrl.password);
process.env.PGDATABASE = parsedUrl.pathname.replace("/", "");
process.env.PGSSLMODE = "require";

try {
  neonConfig.webSocketConstructor = require("ws");
} catch (error) {
  if (typeof WebSocket !== "undefined") {
    neonConfig.webSocketConstructor = WebSocket;
  }
}

const pool = new Pool();
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

const parseCsvLine = (line) => {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  result.push(current);
  return result.map((value) => value.trim());
};

const loadCsv = (filePath) => {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    return row;
  });
};

const main = async () => {
  const csvPath = path.resolve(process.cwd(), "data", "county.csv");
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV not found at ${csvPath}`);
  }

  const rows = loadCsv(csvPath);
  const data = rows.map((row) => ({
    county_code: String(row.county_code || "").trim(),
    county_name: String(row.county_name || "").trim(),
    constituency_name: String(row.constituency_name || "").trim(),
    constituency_ward: String(row.constituencies_wards || "").trim(),
  })).filter((row) =>
    row.county_code && row.county_name && row.constituency_name && row.constituency_ward
  );

  if (!data.length) {
    throw new Error("No valid rows found in county.csv");
  }

  const result = await prisma.location.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`Inserted ${result.count} locations (duplicates skipped).`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
