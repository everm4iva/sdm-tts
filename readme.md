# SDM-TTS (Stardust Manual Text To Speech)

Welcome to the most simple TTS in existence!
Basically, you record the sounds, and the program stitches them together. Just like a puzzle but with audio.

This thing is highly experiemental, it can't possibly be used for anything serious...

## Setup
1. Install [Bun runtine](https://bun.com/)
2. Install ffmpeg or put executable ` in `/core/ffmpeg/`.
3. Create or use a sound profile in `/profiles/`, you can easily create your own profile from there.
4. Run it: `bun core/main.js`.

## How to use (Important!)
The program handles one command at a time. Do not try to combine commands on one line.

Correct usage:
sdm-tts > profile default
sdm-tts > say hello world

Incorrect usage:
sdm-tts > profile default say hello (This will not work!)

> Additionally: don't put things between ""

## Command List
```bash
-| say [text]   -> speak the text and export to /exported
-| read         -> reads the "text.txt" file and exports it
-| profile [name] -> switch the vocal profile
-| pitch [num]  -> adjust the pitch (1.0 is default)
-| speed [num]  -> adjust the speed (1.0 is default)
-| volume [num] -> adjust the volume (1.0 is default)
-| exit         -> leave the program
```

## How it works
The program reads your text and looks up each character (or phoneme like 'sh') in the dictionary. If it finds a matching `.mp3` file in your profile, it adds it to a list.

Then, it tells FFmpeg to glue all those files together and change the pitch/speed/volume based on your config.

```
s / 1 = single letter or number
ss = letter connected to other letters

you can also set whole list of words with individual audio files.
```

Simple as that! ;3
