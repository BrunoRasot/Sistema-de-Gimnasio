// @ts-nocheck
import { defineConfig } from '@prisma/config';
import { config } from 'dotenv';

// Forzamos la carga del archivo .env a la memoria de Node.js
config();

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
