<script lang="ts">
	import Folder from './Folder.svelte';

	import { onMount } from 'svelte';
	import { currentNavigator, currentWorkingDir, currentWorkingDirTree } from './store';

	onMount(() => {
		window.ipc.listen('dirSelected', (selectedDir: string) => {
			currentWorkingDir.set(selectedDir);
			console.log('set working dir');
		});
	});

	const scrollOptions = {
		// width in pixels of the visible scroll area
		width: '100%',

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
	const openSettings = () => {
		$currentNavigator = 'settings';
	};
	const openEditor = () => {
		$currentNavigator = 'editor';
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

		const newDirTree = await window.fs.layerReadDir(newDir, 1, 0);

		currentWorkingDirTree.set(newDirTree);
	};
</script>

<div id="wrapper" class="relative h-full w-full flex flex-col gap-10 items-center bg-gray-700">
	<div id="quicktools" class="w-full flex flex-row gap-5 bg-gray-600 px-5 py-3">
		<div on:click={openDialog}>FolderIcon</div>
	</div>
	<div id="files" class="relative w-full h-5/6 overflow-y-scroll overflow-x-hidden">
		<Folder name={$currentWorkingDir} files={$currentWorkingDirTree} layer={0} expanded={false} />
	</div>
	<div id="tabs" class="w-full flex flex-row gap-5 bg-gray-600 px-5 py-3">
		<div on:click={openSettings}>Settings</div>
		<div on:click={openEditor}>Editor</div>
	</div>
</div>

<style>
	#files::-webkit-scrollbar {
		width: 10px;
		background-color: rgba(255, 255, 255, 0.1);
	}
	#files::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.548);
		width: 5px;
	}
</style>
