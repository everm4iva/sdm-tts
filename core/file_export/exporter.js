/* ☆==== exporter - check exported stuff ====☆*/
import path from 'path';
import fs from 'fs/promises';
import { State } from '../vocals/globals.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

export async function ensureExportDir() {
    const exportPath = path.join(PROJECT_ROOT, 'exported');
    try {
        await fs.mkdir(exportPath, { recursive: true });
    } catch (e) {
        // already exists, just keep going
    }
}

export async function getExportPath(fileName) { // ensure the exported directory exists and return the full path for the file
    await ensureExportDir();
    return path.join(PROJECT_ROOT, 'exported', fileName);
}

export async function cleanupTempFiles() {
    const listFile = path.join(PROJECT_ROOT, 'core', 'ffmpeg', 'list.txt');
    try {
        await fs.unlink(listFile);
    } catch (e) {
        // file might not exist, it's fine
    }
}
