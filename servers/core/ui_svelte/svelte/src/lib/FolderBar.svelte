<script lang="ts">
	import { FolderPlusIcon } from 'svelte-feather-icons';
	import IconButton from './components/IconButton.svelte';
	import Folder from './Folder.svelte';
	import { currentSidebarNavigator, currentWorkingDir, currentWorkingDirTree } from './store';

	const openDialog = async () => {
		window.ipc.send.async('dirDialog', '');
	};
	console.log($currentWorkingDirTree);
	$: folderName = $currentWorkingDir.slice($currentWorkingDir.lastIndexOf('\\') + 1);
</script>

<div class="flex flex-col justify-center gap-6 items-center max-h-full">
	<div
		id="quicktools"
		class="w-3/4 flex flex-row gap-5 bg-gray-700 px-3 py-1 rounded-xl shadow-xl "
	>
		<IconButton icon={FolderPlusIcon} on:click={openDialog} />
	</div>
	<div id="files" class="relative w-full h-5/6 overflow-y-scroll overflow-x-hidden z-10">
		<Folder name={folderName} files={$currentWorkingDirTree} layer={0} expanded={false} />
	</div>
</div>

<style>
	#files::-webkit-scrollbar {
		@apply bg-transparent;
		width: 10px;
	}
	#files::-webkit-scrollbar-thumb {
		@apply bg-white;
		@apply bg-opacity-10;
		border-radius: 0.5em;
		width: 5px;
	}
</style>
