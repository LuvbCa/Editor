<script lang="ts">
	import { ChevronDownIcon, ChevronUpIcon, FolderIcon } from 'svelte-feather-icons';

	import File from './File.svelte';
	import {
		currentWorkingDirTree,
		currentWorkingDirTreeDeepestLayer,
		currentWorkingDir
	} from './store';

	export let expanded = false;
	export let layer: number;
	export let name;
	export let files: LayerDir;

	function walkDownTree(pathToGetTo: string[], _currentWorkingDirTree: LayerDir): LayerDir {
		if (pathToGetTo.length == 0) return _currentWorkingDirTree;
		const currentLayer = _currentWorkingDirTree.children[pathToGetTo.shift()];
		//@ts-ignore
		return walkDownTree(pathToGetTo, currentLayer);
	}

	function getFolderPath(rootPath: string, pathToGetTo: string): string[] {
		const path = pathToGetTo
			.replace(rootPath, '')
			.split('\\')
			.filter((val) => {
				return val !== '';
			});
		console.log(path);
		return path;
	}

	async function toggle() {
		if (files.type === 'directory' && Object.values(files.children).length === 0) {
			if ($currentWorkingDirTreeDeepestLayer > layer) {
				$currentWorkingDirTreeDeepestLayer = layer;
			}

			const path = getFolderPath($currentWorkingDir, files.path);
			const walkedTree = walkDownTree(path, $currentWorkingDirTree);
			const newEntry = await window.fs.layerReadDir(files.path, 1, 0);
			walkedTree.children = newEntry.children;
			$currentWorkingDirTree = $currentWorkingDirTree;
			console.log('read new Dir');
		}
		expanded = !expanded;
	}
</script>

<span
	class="h-6 w-full text-sm flex text-white  transition"
	class:expanded
	on:click={toggle}
>
	<div class="w-6 px-1">
		{#if expanded}
			<ChevronUpIcon />
		{:else}
			<ChevronDownIcon />
		{/if}
	</div>
	{name}
</span>

{#if expanded}
	<ul class="w-full">
		{#each Object.values(files.children) as file}
			<li>
				{#if file.type === 'directory'}
					<svelte:self name={file.name} files={file} expanded={false} layer={layer + 1} />
				{:else}
					<File name={file.name} path={file.path} />
				{/if}
			</li>
		{/each}
	</ul>
{/if}

<style>
	span {
		background-size: 1em 1em;
		font-weight: bold;
		cursor: pointer;
	}

	ul {
		padding: 0.2em 0 0 0.5em;
		margin: 0 0 0 0.5em;
		list-style: none;
		border-left: 1px solid;
		@apply border-gray-700;
	}

	li {
		padding: 0.2em 0;
	}
</style>
