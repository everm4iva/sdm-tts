/* ☆==== Imports ====☆*/
import fs from 'fs/promises';
import path from 'path';
import { State } from './globals.js';
import { fileURLToPath } from 'url';

/* ☆==== check paths ====☆*/
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

/* ☆==== profiling / tracing dictionary  ====☆*/
export async function loadProfile(profileName) {
    const profilePath = path.join(PROJECT_ROOT, 'profiles', profileName);
    
    try {
        await fs.access(profilePath);
        
        const [configText, dictText, wordsText] = await Promise.all([
            fs.readFile(path.join(profilePath, 'config.txt'), 'utf8'),
            fs.readFile(path.join(profilePath, 'dictionary.txt'), 'utf8'),
            fs.readFile(path.join(profilePath, 'words.txt'), 'utf8').catch(() => '') 
        ]);

        const newConfig = configText.split('\n').reduce((acc, line) => {
            const [key, val] = line.split('=');
            if (key && val) acc[key.trim()] = val.trim();
            return acc;
        }, {});

        Object.assign(State.all.config, newConfig);

        const dictMap = new Map(
            dictText.split('\n')
                .filter(line => line.includes('='))
                .map(line => line.split('=').map(part => part.trim()))
        );

        const wordsMap = new Map(
            wordsText.split('\n')
                .filter(line => line.includes('='))
                .map(line => line.split('=').map(part => part.trim()))
        );

        State.set('dictionary', dictMap);
        State.set('words', wordsMap);
        State.set('currentProfile', profileName);
        
        return true;
    } catch (e) {
        return false;
    }
}

/* ☆==== save profiles ====☆*/
export async function saveConfig() {
    const profilePath = path.join(PROJECT_ROOT, 'profiles', State.get('currentProfile'));
    const configContent = Object.entries(State.all.config)
        .map(([k, v]) => `${k}=${v}`)
        .join('\n');
    
    await fs.writeFile(path.join(profilePath, 'config.txt'), configContent);
}

export async function saveConfig() {
    const profilePath = path.join(PROJECT_ROOT, 'profiles', State.get('currentProfile'));
    const configContent = Object.entries(State.all.config)
        .map(([k, v]) => `${k}=${v}`)
        .join('\n');
    
    await fs.writeFile(path.join(profilePath, 'config.txt'), configContent);
}
