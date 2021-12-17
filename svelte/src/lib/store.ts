import { writable } from 'svelte/store';

type Navigator = 'settings' | 'folder';

export const currentSidebarNavigator = writable<Navigator>('folder');

export const currentFile = writable('index.ts');

export const currentWorkingDir = writable('.');

export const currentWorkingDirTree = writable<LayerDir>({});

export const currentWorkingDirTreeDeepestLayer = writable(0);
