<script lang="ts">
	import File from './File.svelte';

	export let expanded = false;
	export let name;
	export let files: RecursiveObject[];

	if (!files) files = [];

	function toggle() {
		expanded = !expanded;
	}
</script>

<span class="w-full text-sm" class:expanded on:click={toggle}>{name}</span>

{#if expanded}
	<ul class="w-full">
		{#each files as file (file.path)}
			<li>
				{#if file.children}
					<svelte:self name={file.name} files={file.children} expanded={false} />
				{:else}
					<File name={file.name} path={file.path} />
				{/if}
			</li>
		{/each}
	</ul>
{/if}

<style>
	span {
		padding: 0 0 0 1.5em;
		background-size: 1em 1em;
		font-weight: bold;
		cursor: pointer;
	}

	ul {
		padding: 0.2em 0 0 0.5em;
		margin: 0 0 0 0.5em;
		list-style: none;
		border-left: 1px solid black;
	}

	li {
		padding: 0.2em 0;
	}
</style>
