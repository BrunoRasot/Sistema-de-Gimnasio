import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ejecutar, postgresEnv, resolverPostgresTool, sha256Archivo } from './postgres-tools.js';

const archivoArg = process.argv.find((valor) => valor.startsWith('--file='));
const confirmacion = process.argv.find((valor) => valor.startsWith('--confirm='));
if (!archivoArg || confirmacion !== '--confirm=RESTAURAR_BASE_DE_DATOS') throw new Error('Uso protegido: pnpm backup:restore --file=backups/archivo.dump --confirm=RESTAURAR_BASE_DE_DATOS');
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL es obligatoria.');
const archivo = path.resolve(archivoArg.slice('--file='.length));
const manifest = JSON.parse(await readFile(`${archivo}.json`, 'utf8'));
if (await sha256Archivo(archivo) !== manifest.sha256) throw new Error('Restauración cancelada: checksum SHA-256 inválido.');
await ejecutar(resolverPostgresTool('pg_restore'), ['--clean', '--if-exists', '--no-owner', '--no-acl', '--exit-on-error', archivo], postgresEnv(databaseUrl));
console.log('Restauración completada. Ejecuta las pruebas de humo antes de habilitar usuarios.');
