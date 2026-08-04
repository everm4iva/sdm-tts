/* ☆==== da main thing====☆*/
import {loadProfile} from './vocals/profileManager.js';
import {stitchAudio} from './encoder/stitcher.js';
import {State} from './vocals/globals.js';
import { getExportPath, cleanupTempFiles } from './file_export/exporter.js';
import fs from 'fs/promises';

const Commands = { // command.. duuh, can't u read?
	profile: async (args) => {
		const pName = args[0];
		if (await loadProfile(pName)) {
			console.log(`switched to profile: ${pName}`);
		} else {
			console.log('profile not found');
		}
	},
	pitch: async (args) => {
		State.setConfig('pitch', parseFloat(args[0]));
		console.log(`pitch updated to ${args[0]}`);
	},
	speed: async (args) => {
		State.setConfig('speed', parseFloat(args[0]));
		console.log(`speed updated to ${args[0]}`);
	},
	volume: async (args) => {
		State.setConfig('volume', parseFloat(args[0]));
		console.log(`volume updated to ${args[0]}`);
	},
	say: async (args) => {
		const text = args.join(' ');
		const fileName = `output_${Date.now()}.wav`;
		const fullPath = await getExportPath(fileName);
		try {
			await stitchAudio(text, fullPath);
			await cleanupTempFiles();
			console.log(`success: ${fullPath}`);
		} catch (e) {
			console.log(`error: ${e.message}`);
		}
	},
	read: async () => {
		try {
			const text = await fs.readFile('text.txt', 'utf8');
			const fileName = `output_text_${Date.now()}.wav`;
			const fullPath = await getExportPath(fileName);
			await stitchAudio(text, fullPath);
			await cleanupTempFiles();
			console.log(`success reading text.txt: ${fullPath}`);
		} catch (e) {
			console.log(`error reading text.txt: ${e.message}`);
		}
	},
	exit: () => {
		process.exit(0);
	},
};

// another command bussiness
async function handleCommand(input) {
	const [cmdName, ...args] = input.trim().split(/\s+/);
	const command = Commands[cmdName.toLowerCase()];
	
	if (command) {
		await command(args);
	} else {
		console.log(`unknown command: ${cmdName}`);
	}
}

// main loop (saying this feeling like python lol)
async function main() {
	const args = process.argv.slice(2);
	
	if (args.length > 0) {
		await handleCommand(args.join(' '));
	} else {
		console.log('SDM-TTS Engine Loaded');
		console.log('Available: profile, pitch, speed, volume, say, read, exit');
		
		while (true) {
			process.stdout.write('sdm-tts > ');
			const input = await new Promise((resolve) => {
				process.stdin.once('data', (data) => resolve(data.toString()));
			});
			await handleCommand(input);
		}
	}
}

await loadProfile('default');
main();

