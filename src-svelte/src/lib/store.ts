import { writable } from 'svelte/store';

export const currentEditor = writable('esadasdas');

export const currentWorkingDir = writable('C:\\Users\\lmima\\Documents\\BWINF2021');

export const currentWorkingDirTree = writable<RecursiveObject[]>([]);
