/* ☆==== Cute globals ====☆*/
const state = {
    currentProfile: 'default',
    config: {
        pitch: 1.0,
        speed: 1.0,
        volume: 1.0,
        format: 'wav',
        language: 'en'
    },
    dictionary: new Map(),
    words: new Map()
};

export const State = {
    get(key) { return state[key]; },
    set(key, value) { state[key] = value; },
    getConfig(key) { return state.config[key]; },
    setConfig(key, value) { state.config[key] = value; },
    getDict(char) { return state.dictionary.get(char); },
    setDict(char, file) { state.dictionary.set(char, file); },
    getWord(word) { return state.words.get(word.toLowerCase()); },
    setWord(word, file) { state.words.set(word.toLowerCase(), file); },
    get all() { return state; }
};
