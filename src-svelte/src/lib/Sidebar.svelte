<script lang="ts">
	import { FolderIcon, FilePlusIcon, AwardIcon } from 'svelte-feather-icons';
	// import { fs, dialog } from '@tauri-apps/api';
	import fs from 'fs';

	import { ipcRenderer } from 'electron';

	import { slimscroll } from 'svelte-slimscroll';

	import File from './File.svelte';

	import { currentEditor } from './store';
	import { invoke } from '@tauri-apps/api/tauri';

	const MAX_LAYERS = 2;

	interface File {
		size: number;
		path: string;
		name?: string;
		children?: File[];
	}

	let availableFiles: File[] = [];

	const scrollOptions = {
		// width in pixels of the visible scroll area
		width: 'auto',

		// height in pixels of the visible scroll area
		height: '100%',

		// width in pixels of the scrollbar and rail
		size: '5px',

		// scrollbar color, accepts any hex/color value
		color: '#000',

		// scrollbar position - left/right
		position: 'right',

		// distance in pixels between the side edge and the scrollbar
		distance: '2px',

		// default scroll position on load - top / bottom / $('selector')
		start: 'top',

		// sets scrollbar opacity
		opacity: 0.4,

		// enables always-on mode for the scrollbar
		alwaysVisible: false,

		// check if we should hide the scrollbar when user is hovering over
		disableFadeOut: false,

		// sets visibility of the rail
		railVisible: false,

		// sets rail color
		railColor: '#333',

		// sets rail opacity
		railOpacity: 0.2,

		// whether  we should use jQuery UI Draggable to enable bar dragging
		railDraggable: true,

		// defautlt CSS class of the slimscroll rail
		railClass: 'slimScrollRail',

		// defautlt CSS class of the slimscroll bar
		barClass: 'slimScrollBar',

		// defautlt CSS class of the slimscroll wrapper
		wrapperClass: 'slimScrollDiv',

		// check if mousewheel should scroll the window if we reach top/bottom
		allowPageScroll: false,

		// scroll amount applied to each mouse wheel step
		wheelStep: 5,

		// scroll amount applied when user is using gestures
		touchScrollStep: 200
	};

	const openDialog = async () => {
		availableFiles = [];

		const result = window.api.send('dirDialog');
		return;
		if (typeof result !== 'string') return;
		const files = fs.opendirSync(result);

		console.log(files.readSync());

		availableFiles = await readFilesSize(files, 0);
		console.log(availableFiles);
	};

	const unwrapFiles = () => {};

	const readFilesSize = async (files: fs.FileEntry[], layer: number): Promise<File[]> => {
		const sizeFile: File[] = [];
		for (let i = 0; i < files.length; i++) {
			const { path, name, children } = files[i];

			if (layer >= MAX_LAYERS) {
				sizeFile.push({
					path,
					name,
					children: undefined,
					size: 0
				});
				return;
			}

			if (children) {
				const readFile = await fs.readDir(path);
				const childs = await readFilesSize(readFile, layer + 1);

				sizeFile.push({
					path,
					name,
					children: childs,
					size: 0
				});
			} else {
				const size = await invoke('file_size', { path });

				sizeFile.push({
					path,
					name,
					children: undefined,
					size: typeof size == 'string' ? parseInt(size) : 0
				});
			}
		}
		return sizeFile;
	};

	const readFileIntoEditor = async (path: string) => {
		const readFile = await fs.readTextFile(path);

		currentEditor.set(readFile);
	};
</script>

<div id="wrapper" class="relative h-screen flex flex-col gap-10 items-center bg-gray-700">
	<div id="quicktools" class="w-full flex flex-row gap-5 bg-gray-600 px-5 py-3">
		<div on:click={openDialog}>
			<FolderIcon size="40%" />
		</div>
	</div>
	<div
		id="files"
		use:slimscroll={scrollOptions}
		class="relative w-full h-auto flex flex-col gap-2 items-center overflow-hidden"
	>
		{#each availableFiles as file}
			{#each new Array(MAX_LAYERS) as _, i}
				<File
					type={file.children ? 'folder' : 'file'}
					name={file.name}
					size={file.size}
					children={file.children}
					click={() => {
						readFileIntoEditor(file.path);
					}}
				/>
			{/each}
		{/each}
	</div>
</div>

<style>
	#files::-webkit-scrollbar {
		width: 0.5em;
	}

	#files::-webkit-scrollbar-thumb {
		--opacity: 0;
		background-color: rgb(255, 255, 255, var(--opacity));
	}
	#files::-webkit-scrollbar-thumb:hover {
		--opacity: 1;
	}
</style>
