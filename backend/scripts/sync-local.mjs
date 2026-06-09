import mysql from 'mysql2/promise';

const REMOTE = {
  host: 'mysql-9465549-robercalero2004-69ea.i.aivencloud.com', port: 16883,
  user: 'avnadmin', password: process.argv[2],
  database: 'cbtomelloso', ssl: { rejectUnauthorized: false }
};
const LOCAL = {
  host: '127.0.0.1', port: 3306,
  user: 'root', password: '123',
  multipleStatements: true
};

if (!process.argv[2]) { console.error('Uso: node scripts/sync-local.mjs <REMOTE_PASSWORD>'); process.exit(1); }

const remote = await mysql.createConnection(REMOTE);
const local = await mysql.createConnection(LOCAL);
console.log('✓ Conectado a Aiven y Local');

// 1. Drop + recreate local database
await local.query('DROP DATABASE IF EXISTS cbtomelloso');
await local.query('CREATE DATABASE cbtomelloso CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
await local.query('USE cbtomelloso');
console.log('✓ Base de datos local recreada');

// 2. Get tables and their CREATE statements from remote
const [tables] = await remote.query('SHOW TABLES');
const tableNames = tables.map(t => Object.values(t)[0]);

for (const table of tableNames) {
  const [ddlRows] = await remote.query(`SHOW CREATE TABLE \`${table}\``);
  let ddl = ddlRows[0]['Create Table'];

  // Replace double-quote identifiers with backticks for MariaDB compat
  ddl = ddl.replace(/(?<=[\s,()])"(\w+)"(?=[\s,()])/g, '`$1`');
  // Also handle cases like COLLATE with quotes
  ddl = ddl.replace(/COLLATE=("[^"]+")/g, (_m, c) => `COLLATE=${c.replace(/"/g, '')}`);

  await local.query(ddl);
  console.log(`  ✓ Tabla ${table} creada`);
}

// 3. Copy data
for (const table of tableNames) {
  const [rows] = await remote.query(`SELECT * FROM \`${table}\``);
  if (rows.length === 0) continue;

  const columns = Object.keys(rows[0]);
  const colList = columns.map(c => '`' + c + '`').join(', ');
  const placeholders = columns.map(() => '?').join(', ');

  for (const row of rows) {
    const values = columns.map(col => {
      const v = row[col];
      if (v instanceof Date) return v.toISOString().slice(0, 19).replace('T', ' ');
      return v;
    });
    await local.query(
      `INSERT INTO \`${table}\` (${colList}) VALUES (${placeholders})`,
      values
    );
  }
  console.log(`  ✓ ${rows.length} registros en ${table}`);
}

// 4. Verify
const [teams] = await local.query('SELECT id, name, category, coach FROM teams ORDER BY id');
console.log('\n--- EQUIPOS LOCALES ---');
teams.forEach(t => console.log(`  ${t.id}: ${t.name} (${t.category}) - ${t.coach || '?'}`));

const [counts] = await local.query(
  'SELECT t.name, COUNT(p.id) AS players FROM teams t LEFT JOIN players p ON p.team_id = t.id GROUP BY t.id ORDER BY t.id'
);
counts.forEach(c => console.log(`  ${c.name}: ${c.players} jugadores`));

await remote.end();
await local.end();
console.log('\n✓ Sincronización completada');
