import 'dotenv/config';
import { mkdir, readdir, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ejecutar, postgresEnv, resolverPostgresTool, sha256Archivo } from './postgres-tools.js';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL es obligatoria.');
const directorio = path.resolve(process.env.BACKUP_DIR || 'backups');
const retencionDias = Math.max(1, Number(process.env.BACKUP_RETENTION_DAYS || 30));
await mkdir(directorio, { recursive: true });
const marca = new Date().toISOString().replace(/[:.]/g, '-');
const archivo = path.join(directorio, `templogym-${marca}.dump`);
await ejecutar(resolverPostgresTool('pg_dump'), ['--format=custom', '--compress=9', '--no-owner', '--no-acl', '--file', archivo], postgresEnv(databaseUrl));
const info = await stat(archivo);
if (info.size === 0) throw new Error('El respaldo generado está vacío.');
const manifest = { archivo: path.basename(archivo), creadoEn: new Date().toISOString(), bytes: info.size, sha256: await sha256Archivo(archivo), formato: 'postgres-custom-v1' };
await writeFile(`${archivo}.json`, JSON.stringify(manifest, null, 2), 'utf8');
const limite = Date.now() - retencionDias * 86_400_000;
for (const nombre of await readdir(directorio)) {
  if (!nombre.startsWith('templogym-')) continue;
  const ruta = path.join(directorio, nombre);
  if ((await stat(ruta)).mtimeMs < limite) await unlink(ruta);
}
console.log(`Respaldo creado y verificado: ${archivo} (${info.size} bytes)`);
