/**
 * Load .env before any other app code runs.
 * In ESM, imports are hoisted, so server.js must import this first
 * so that SMTP and other env vars are available when email.js etc. load.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Resolve .env from backend root (parent of src/) so it works regardless of cwd
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
