import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { accessSync, readdirSync } from 'node:fs';
import path from 'node:path';

export const postgresEnv = (databaseUrl: string) => {
  const url = new URL(databaseUrl);
  return { ...process.env, PGHOST: url.hostname, PGPORT: url.port || '5432', PGUSER: decodeURIComponent(url.username), PGPASSWORD: decodeURIComponent(url.password), PGDATABASE: decodeURIComponent(url.pathname.replace(/^\//, '')) };
};

export const ejecutar = (comando: string, args: string[], env: NodeJS.ProcessEnv) => new Promise<void>((resolve, reject) => {
  const proceso = spawn(comando, args, { env, stdio: 'inherit', shell: false });
  proceso.once('error', (error) => reject(new Error(`No se pudo ejecutar ${comando}. Instala PostgreSQL Client Tools. ${error.message}`)));
  proceso.once('exit', (codigo) => codigo === 0 ? resolve() : reject(new Error(`${comando} finalizó con código ${codigo}`)));
});

export const resolverPostgresTool = (nombre: 'pg_dump' | 'pg_restore') => {
  const ejecutable = process.platform === 'win32' ? `${nombre}.exe` : nombre;
  const candidatos: string[] = [];
  if (process.env.PG_BIN) candidatos.push(path.join(process.env.PG_BIN, ejecutable));
  if (process.platform === 'win32') {
    const raiz = path.join(process.env.ProgramFiles || 'C:\\Program Files', 'PostgreSQL');
    try {
      for (const version of readdirSync(raiz).sort((a, b) => Number(b) - Number(a))) candidatos.push(path.join(raiz, version, 'bin', ejecutable));
    } catch { /* Se utilizará PATH. */ }
  }
  for (const candidato of candidatos) {
    try { accessSync(candidato); return candidato; } catch { /* continúa */ }
  }
  return nombre;
};

export const sha256Archivo = (ruta: string) => new Promise<string>((resolve, reject) => {
  const hash = createHash('sha256');
  createReadStream(ruta).on('data', (data) => hash.update(data)).once('error', reject).once('end', () => resolve(hash.digest('hex')));
});
