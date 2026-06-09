import mysql from 'mysql2/promise';

const [,, pw] = process.argv;
if (!pw) { console.error('Uso: node scripts/seed-rosters.mjs <DB_PASSWORD>'); process.exit(1); }

const conn = await mysql.createConnection({
  host: 'mysql-9465549-robercalero2004-69ea.i.aivencloud.com', port: 16883,
  user: 'avnadmin', password: pw, database: 'cbtomelloso',
  ssl: { rejectUnauthorized: false }, charset: 'utf8mb4',
});

console.log('Conectado a Aiven MySQL');

// 1. Delete teams that shouldn't exist (CB B and Cadete)
await conn.execute(`DELETE FROM matches WHERE team_id IN (2, 4)`);
await conn.execute(`DELETE FROM players WHERE team_id IN (2, 4)`);
await conn.execute(`DELETE FROM teams WHERE id IN (2, 4)`);
console.log('✓ Eliminados CB Tomelloso B y Cadete');

// 2. Update existing teams
await conn.execute(`UPDATE teams SET name = 'Val Brokers CB Tomelloso', category = 'Senior Autonómica', coach = 'Aaron Núñez Ventura' WHERE id = 1`);
await conn.execute(`UPDATE teams SET name = 'CB Tomelloso U19 Amarillo', category = 'Junior U19', coach = 'Ramón Cañas' WHERE id = 3`);
await conn.execute(`UPDATE teams SET name = 'CB Tomelloso U19 Verde', category = 'Junior U19' WHERE id = 7`);
await conn.execute(`UPDATE teams SET name = 'CB Tomelloso Minibasket', category = 'Minibasket' WHERE id = 5`);

// 3. Delete and re-insert Senior players
await conn.execute(`DELETE FROM players WHERE team_id = 1`);

const seniorPlayers = [
  ['Miguel Ángel', 'Lara',          null, 'Ala-Pívot'],
  ['Javier',       'Blanco',        null, 'Escolta'],
  ['Daniel',       'Bonillo',        null, 'Base'],
  ['Adrián',       'Sánchez-Migallón', null, 'Alero'],
  ['Alonso',       'Cobo',          null, 'Alero'],
  ['Javier',       'Bonillo',       null, 'Escolta'],
  ['Jorge',        'Tejeda',        null, 'Base'],
  ['Chema',        null,            null, 'Alero'],
  ['Araujo',       null,            null, 'Ala-Pívot'],
  ['Cristian',     'Grande',        null, 'Escolta'],
  ['Raúl',         null,            null, 'Base'],
  ['Carlos',       'Madrigal',      null, 'Alero'],
  ['Chayun',       null,            null, 'Pívot'],
  ['Cele',         'Pedroche',      null, 'Escolta'],
  ['Román',        null,            null, 'Alero'],
  ['Naranjo',      null,            null, 'Ala-Pívot'],
  ['Adrián',       'Ramírez',       null, 'Base'],
];

for (const [name, surname, dorsal, position] of seniorPlayers) {
  await conn.execute(
    `INSERT INTO players (team_id, name, surname, dorsal, position, nationality, is_active)
     VALUES (1, ?, ?, ?, ?, 'España', 1)`,
    [name, surname || '', dorsal, position]
  );
}
console.log(`✓ ${seniorPlayers.length} jugadores Senior añadidos`);

// 4. Delete and re-insert U19 Amarillo players
await conn.execute(`DELETE FROM players WHERE team_id = 3`);

const u19Amarillo = [
  ['Rebollo',  null,     null, 'Alero'],
  ['Pablo',    null,     null, 'Base'],
  ['Jorge',    'Castro', null, 'Ala-Pívot'],
  ['Raúl',     'Ruiz',   null, 'Base'],
  ['Bryan',    null,     null, 'Escolta'],
  ['Carlos',   'García', null, 'Alero'],
  ['Carlos',   'González', null, 'Pívot'],
  ['Juan',     'Darío',  null, 'Escolta'],
  ['Alejandro', null,    null, 'Alero'],
  ['José',     'Ángel',  null, 'Base'],
  ['Iván',     null,     null, 'Pívot'],
  ['Lucas',    'Sánchez', null, 'Escolta'],
  ['Marcial',  null,     null, 'Ala-Pívot'],
];

for (const [name, surname, dorsal, position] of u19Amarillo) {
  await conn.execute(
    `INSERT INTO players (team_id, name, surname, dorsal, position, nationality, is_active)
     VALUES (3, ?, ?, ?, ?, 'España', 1)`,
    [name, surname || '', dorsal, position]
  );
}
console.log(`✓ ${u19Amarillo.length} jugadores U19 Amarillo añadidos`);

// 5. Delete and re-insert U19 Verde players
await conn.execute(`DELETE FROM players WHERE team_id = 7`);

const u19Verde = [
  ['Omar',   'Ezequiel', null, 'Ala-Pívot'],
  ['Lin',    null,       null, 'Escolta'],
  ['Mendoza', null,      null, 'Pívot'],
  ['Miguel', null,       null, 'Base'],
  ['Adrián', 'Garrido',  null, 'Alero'],
  ['Alexis', null,       null, 'Escolta'],
  ['Juan',   'Romero',   null, 'Base'],
  ['Iván',   'Lomas',    null, 'Alero'],
];

for (const [name, surname, dorsal, position] of u19Verde) {
  await conn.execute(
    `INSERT INTO players (team_id, name, surname, dorsal, position, nationality, is_active)
     VALUES (7, ?, ?, ?, ?, 'España', 1)`,
    [name, surname || '', dorsal, position]
  );
}
console.log(`✓ ${u19Verde.length} jugadores U19 Verde añadidos`);

// 6. Delete old matches (from deleted teams and to re-sync)
await conn.execute(`DELETE FROM matches WHERE team_id NOT IN (1, 3, 7, 5)`);

// 7. Update matches - remove matches referencing deleted teams (Bolaños, etc. are fine)
// re-insert with fresh data
await conn.execute(`DELETE FROM matches WHERE team_id IN (1, 3, 7)`);

const matches = [
  // Senior
  [1, 'Val Brokers CB Tomelloso', 'Basket Cervantes',             '2025-10-26', '18:00:00', 'Liga STM 1ª Autonómica', 'Pabellón San José',       1, 105, 64,  'finished'],
  [1, 'Val Brokers CB Tomelloso', 'UCA',                          '2025-12-15', '18:00:00', 'Liga STM 1ª Autonómica', 'Pabellón San José',       1, 73,  75,  'finished'],
  [1, 'Val Brokers CB Tomelloso', 'CB Miguel Esteban',            '2026-01-24', '18:00:00', 'Liga STM 1ª Autonómica', 'Pabellón San José',       1, 93,  73,  'finished'],
  [1, 'CB Bolaños - García Hermanos', 'Val Brokers CB Tomelloso', '2026-03-14', '18:00:00', 'Play Off 1ª Autonómica', 'Pabellón Municipal Bolaños', 0, 73, 71,  'finished'],
  [1, 'Val Brokers CB Tomelloso', 'Opticalia Manzanares',         '2026-09-20', '18:00:00', 'Liga STM 1ª Autonómica', 'Pabellón San José',       1, null, null, 'scheduled'],
  [1, 'Val Brokers CB Tomelloso', 'UCA',                          '2026-10-04', '18:30:00', 'Liga STM 1ª Autonómica', 'Pabellón San José',       1, null, null, 'scheduled'],
  [1, 'ADB Hellín',               'Val Brokers CB Tomelloso',     '2026-10-11', '12:00:00', 'Liga STM 1ª Autonómica', 'Pabellón Hellín',         0, null, null, 'scheduled'],
  // U19 Amarillo
  [3, 'CB Tomelloso U19 Amarillo', 'Argamasilla U19',             '2026-01-10', '17:00:00', 'Liga U19 Masculina',     'Pabellón San José',       1, 54,  46,  'finished'],
  [3, 'CB Tomelloso U19 Amarillo', 'CB Miguel Esteban U19',       '2026-01-24', '16:00:00', 'Liga U19 Masculina',     'Pabellón San José',       1, 89,  20,  'finished'],
  [3, 'Miguelturra U19',          'CB Tomelloso U19 Amarillo',    '2026-02-22', '12:00:00', 'Liga U19 Masculina',     'Pabellón Miguelturra',    0, null, null, 'finished'],
  [3, 'CB Tomelloso U19 Amarillo', 'Basket Cervantes U19',        '2026-03-08', '17:00:00', 'Liga U19 Masculina',     'Pabellón San José',       1, 78,  45,  'finished'],
  [3, 'CB Tomelloso U19 Amarillo', 'Puertollano U19',             '2026-03-29', '17:00:00', 'Liga U19 Masculina',     'Pabellón San José',       1, 80,  48,  'finished'],
  [3, 'CB Tomelloso U19 Amarillo', 'ADB Hellín U19',              '2026-09-28', '17:00:00', 'Liga U19 Masculina',     'Pabellón San José',       1, null, null, 'scheduled'],
  // U19 Verde
  [7, 'Miguelturra U19',          'CB Tomelloso U19 Verde',       '2026-03-29', '12:00:00', 'Liga U19 Masculina',     'Pabellón Miguelturra',    0, 120, 27,  'finished'],
  [7, 'CB Tomelloso U19 Verde',   'Opticalia Manzanares U19',     '2026-09-28', '17:00:00', 'Liga U19 Masculina',     'Pabellón San Antonio',    1, null, null, 'scheduled'],
];

for (const [teamId, home, away, date, time, comp, venue, isHome, sHome, sAway, status] of matches) {
  await conn.execute(
    `INSERT INTO matches (team_id, homeTeam, awayTeam, match_date, match_time, competition, venue, is_home, score_home, score_away, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [teamId, home, away, date, time, comp, venue, isHome, sHome, sAway, status]
  );
}
console.log(`✓ ${matches.length} partidos actualizados`);

// Verify
const [teams] = await conn.query('SELECT id, name, category, coach FROM teams ORDER BY id');
console.log('\n--- EQUIPOS ---');
teams.forEach(t => console.log(`  ${t.id}: ${t.name} (${t.category}) - ${t.coach || '?'}`));

const [counts] = await conn.query(
  'SELECT t.name, COUNT(p.id) AS players FROM teams t LEFT JOIN players p ON p.team_id = t.id GROUP BY t.id ORDER BY t.id'
);
console.log('\n--- JUGADORES POR EQUIPO ---');
counts.forEach(c => console.log(`  ${c.name}: ${c.players} jugadores`));

const [mCounts] = await conn.query(
  'SELECT t.name, COUNT(m.id) AS matches FROM teams t LEFT JOIN matches m ON m.team_id = t.id GROUP BY t.id ORDER BY t.id'
);
console.log('\n--- PARTIDOS POR EQUIPO ---');
mCounts.forEach(m => console.log(`  ${m.name}: ${m.matches} partidos`));

await conn.end();
console.log('\n✓ Rosters completados');
