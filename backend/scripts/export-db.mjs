import mysql from 'mysql2/promise';
import fs from 'fs';

const [,, pw, output] = process.argv;
if (!pw || !output) {
  console.error('Uso: node scripts/export-db.mjs <DB_PASSWORD> <output.sql>');
  process.exit(1);
}

const conn = await mysql.createConnection({
  host: 'mysql-9465549-robercalero2004-69ea.i.aivencloud.com', port: 16883,
  user: 'avnadmin', password: pw, database: 'cbtomelloso',
  ssl: { rejectUnauthorized: false }, charset: 'utf8mb4',
  multipleStatements: true,
});

const lines = [];
lines.push('-- ============================================================');
lines.push('-- CB Tomelloso — dump completo');
lines.push(`-- Generado: ${new Date().toISOString()}`);
lines.push('-- ============================================================');
lines.push('');
lines.push('CREATE DATABASE IF NOT EXISTS cbtomelloso CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
lines.push('USE cbtomelloso;');
lines.push('');

const [tables] = await conn.query('SHOW TABLES');
const tableNames = tables.map(t => Object.values(t)[0]);

// Disable FK checks for clean import
lines.push('SET FOREIGN_KEY_CHECKS = 0;');
lines.push('');

for (const table of tableNames) {
  // Drop + Create
  const [ddl] = await conn.query(`SHOW CREATE TABLE \`${table}\``);
  const createStmt = ddl[0]['Create Table'];
  lines.push(`DROP TABLE IF EXISTS \`${table}\`;`);
  lines.push(createStmt + ';');
  lines.push('');

  // Export data
  const [rows] = await conn.query(`SELECT * FROM \`${table}\``);
  if (rows.length === 0) continue;

  const columns = Object.keys(rows[0]);
  const colList = columns.map(c => '`' + c + '`').join(', ');

  for (const row of rows) {
    const values = columns.map(col => {
      const v = row[col];
      if (v === null || v === undefined) return 'NULL';
      if (v instanceof Date) return "'" + v.toISOString().slice(0, 19).replace('T', ' ') + "'";
      if (typeof v === 'number') return String(v);
      // Escape single quotes, backslashes, etc.
      const escaped = String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      return "'" + escaped + "'";
    });
    lines.push(`INSERT INTO \`${table}\` (${colList}) VALUES (${values.join(', ')});`);
  }
  lines.push('');
}

lines.push('SET FOREIGN_KEY_CHECKS = 1;');
lines.push('');

fs.writeFileSync(output, lines.join('\n'), 'utf8');
console.log(`✓ Exportado a ${output} (${lines.length} líneas)`);
await conn.end();
