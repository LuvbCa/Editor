<script lang="ts">
	import { onMount } from 'svelte';
	import { currentSidebarNavigator, currentWorkingDir, currentWorkingDirTree } from './store';
	import FolderBar from './FolderBar.svelte';
	import Settings from './Settings.svelte';
	import { fly } from 'svelte/transition';

	import { SettingsIcon, FolderIcon } from 'svelte-feather-icons';
	import IconButton from './components/IconButton.svelte';

	onMount(() => {
		window.ipc.listen('dirSelected', (selectedDir: string) => {
			currentWorkingDir.set(selectedDir);
			console.log('set working dir');
		});
	});

	const openFolder = () => {
		$currentSidebarNavigator = 'folder';
	};
	const openSettings = () => {
		$currentSidebarNavigator = 'settings';
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

<div id="wrapper" class="relative h-full w-full flex flex-col items-center bg-gray-900">
	<div class="h-full w-full max-h-full overflow-hidden">
		{#if $currentSidebarNavigator === 'folder'}
			<div in:fly={{ y: 1000, delay: 0, duration: 350, opacity: 1 }}>
				<FolderBar />
			</div>
		{:else if $currentSidebarNavigator === 'settings'}
			<div transition:fly>
				<Settings />
			</div>
		{/if}
	</div>
	<div id="tabs" class="w-5/6 flex flex-row bg-gray-700 h-12 rounded-lg shadow-xl mb-5 px-2">
		<div
			on:click={openSettings}
			class:bg-gray-900={$currentSidebarNavigator === 'settings'}
			class:-translate-y-2={$currentSidebarNavigator === 'settings'}
			class:rounded-b-lg={$currentSidebarNavigator === 'settings'}
			class="px-3 transition"
		>
			<IconButton icon={SettingsIcon} />
		</div>
		<div
			on:click={openFolder}
			class:bg-gray-900={$currentSidebarNavigator === 'folder'}
			class:-translate-y-2={$currentSidebarNavigator === 'folder'}
			class:rounded-b-lg={$currentSidebarNavigator === 'folder'}
			class="px-3 transition"
		>
			<IconButton icon={FolderIcon} />
		</div>
	</div>
</div>

<style>
	.gradient {
		background: linear-gradient(to left, rgb(255, 30, 0), rgb(106, 106, 255));
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}
</style>
