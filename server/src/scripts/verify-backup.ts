import 'dotenv/config';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { ejecutar, postgresEnv, resolverPostgresTool, sha256Archivo } from './postgres-tools.js';

const argumento = process.argv.find((valor) => valor.startsWith('--file='));
if (!argumento) throw new Error('Uso: pnpm backup:verify --file=backups/archivo.dump');
const archivo = path.resolve(argumento.slice('--file='.length));
const manifest = JSON.parse(await readFile(`${archivo}.json`, 'utf8'));
const info = await stat(archivo);
if (info.size !== manifest.bytes || await sha256Archivo(archivo) !== manifest.sha256) throw new Error('El respaldo no supera la verificación SHA-256.');
await ejecutar(resolverPostgresTool('pg_restore'), ['--list', archivo], postgresEnv(process.env.DATABASE_URL || 'postgresql://localhost/postgres'));
console.log(`Respaldo íntegro y legible: ${archivo}`);
