import { writable } from 'svelte/store';

type Navigator = 'settings' | 'editor';

export const currentNavigator = writable<Navigator>('editor');

export const currentFile = writable('index.ts');

export const currentWorkingDir = writable('C:\\Users\\lmima\\Documents\\BWINF2021\\aufgabe2\\src');

export const currentWorkingDirTree = writable<RecursiveObject[]>([]);
