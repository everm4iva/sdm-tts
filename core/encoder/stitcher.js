/* ☆==== DA MAGIC FILE!!! ====☆*/
import {spawn} from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import {State} from '../vocals/globals.js';
import {fileURLToPath} from 'url';

/* ☆==== checking paths ====☆*/
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

/* ☆==== stitching audio ====☆*/
export async function stitchAudio(text, outputFileName) {
	const profile = State.get('currentProfile');
	const soundsFolder = path.join(PROJECT_ROOT, 'profiles', profile, 'sounds');
	const wordsFolder = path.join(PROJECT_ROOT, 'profiles', profile, 'words');
	const dict = State.get('dictionary');
	const wordsDict = State.get('words');

	const filesToStitch = [];

	const inputWords = text.split(/(\s+)/);

	for (const word of inputWords) {
		if (!word) continue;

		if (/^\s+$/.test(word)) {
			const spaceSound = dict.get(' ');
			if (spaceSound) {
				const fullPath = path.join(soundsFolder, spaceSound);
				try {
					await fs.access(fullPath);
					filesToStitch.push(fullPath);
				} catch (e) {}
			}
			continue;
		}

		const cleanWord = word.trim().toLowerCase();

		if (wordsDict.has(cleanWord)) {
			const wordFile = wordsDict.get(cleanWord);
			const fullPath = path.join(wordsFolder, wordFile);
			try {
				await fs.access(fullPath);
				filesToStitch.push(fullPath);
				continue;
			} catch (e) {
				// file missing in the current profile, fallback to phonemes
			}
		}

		let i = 0; // nerd index for making stuff through the word
		while (i < word.length) {
			let matched = false;
			const currentChar = word[i].toLowerCase();

			if (i + 1 < word.length) { // check for pairs of characters
				const nextChar = word[i + 1].toLowerCase();
				const pair = currentChar + nextChar;

				if (i === word.length - 2) { // if it's the last pair, check for a special ending sound
					const endPair = pair + 'a';
					if (dict.has(endPair)) {
						const f = path.join(soundsFolder, dict.get(endPair));
						try {
							await fs.access(f);
							filesToStitch.push(f);
						} catch (e) {}
						i += 2;
						matched = true;
					}
				}

				if (!matched && dict.has(pair)) { // if the pair exists in the dictionary, use it
					const f = path.join(soundsFolder, dict.get(pair));
					try {
						await fs.access(f);
						filesToStitch.push(f);
					} catch (e) {}
					i += 2;
					matched = true;
				} else if (!matched && currentChar === nextChar) {
					if (dict.has(currentChar)) { // if the current character exists in the dictionary, use it
						const f = path.join(soundsFolder, dict.get(currentChar));
						try {
							await fs.access(f);
							filesToStitch.push(f);
						} catch (e) {}
					}
					i++;
					matched = true;
				}
			}

			if (!matched) { // if no pair was matched, check for a single character
				if (dict.has(currentChar)) {
					const f = path.join(soundsFolder, dict.get(currentChar));
					try {
						await fs.access(f);
						filesToStitch.push(f);
					} catch (e) {}
				}
				i++;
			}
		}
	}

	if (filesToStitch.length === 0) throw new Error('no matching sounds found for text'); // cute error if no sounds were found

	// create a temporary list file for ffmpeg to read
	const listFile = path.join(PROJECT_ROOT, 'core', 'ffmpeg', 'list.txt');
	const listContent = filesToStitch.map((f) => `file '${f.replace(/\\/g, '/')}'`).join('\n');
	await fs.writeFile(listFile, listContent);

	return new Promise((resolve, reject) => {
		const ffmpegPath = path.join(PROJECT_ROOT, 'core', 'ffmpeg', 'ffmpeg.exe');
		const outputPath = outputFileName;

		const args = [
			'-f',
			'concat',
			'-safe',
			'0',
			'-i',
			listFile,
			'-af',
			`atempo=${State.getConfig('speed')},asetrate=44100*${State.getConfig('pitch')},aresample=44100`,
			'-vol',
			State.getConfig('volume'),
			'-y',
			outputPath,
		];

		const proc = spawn(ffmpegPath, args);

		let stderr = ''; // to capture any error messages from ffmpeg
		proc.stderr.on('data', (data) => {
			stderr += data.toString();
		});

		proc.on('close', (code) => { // when ffmpeg finishes
			if (code === 0) resolve(outputPath);
			else reject(new Error(`ffmpeg process exited with code ${code}. Stderr: ${stderr}`));
		});

		proc.on('error', reject);
	});
}
