<script lang="ts">
	import { slimscroll } from 'svelte-slimscroll';

	import Folder from './Folder.svelte';

	import { onMount } from 'svelte';
	import { currentWorkingDir, currentWorkingDirTree } from './store';

	onMount(() => {
		window.ipc.listen('dirSelected', (selectedDir: string) => {
			currentWorkingDir.set(selectedDir);
			console.log('set working dir');
		});
	});

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
		window.ipc.send.async('dirDialog', '');
	};

	$: updateState($currentWorkingDir);

	const updateState = (newDir: string) => {
		updateFolder(newDir);
	};

	const updateEditor = async (path: string) => {
		console.log('switched dir');
		// const readFile = await fs.readTextFile(path);
		// currentEditor.set(readFile);
	};
	const updateFolder = async (newDir: string) => {
		console.log('read working dir tree');

		const newDirTree = await window.fs.readDir(newDir);

		currentWorkingDirTree.set(newDirTree);

		console.log($currentWorkingDirTree);
	};
</script>

<div id="wrapper" class="relative h-screen flex flex-col gap-10 items-center bg-gray-700">
	<div id="quicktools" class="w-full flex flex-row gap-5 bg-gray-600 px-5 py-3">
		<div on:click={openDialog}>
			<!-- <FolderIcon size="40%" /> -->
			FolderIcon
		</div>
	</div>
	<div
		id="files"
		use:slimscroll={scrollOptions}
		class="relative w-full h-auto flex flex-col gap-2 items-center overflow-hidden"
	>
		<Folder name="Home" files={$currentWorkingDirTree} expanded={false} />
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
