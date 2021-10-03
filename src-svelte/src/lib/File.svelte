<script lang="ts">
	export let name = 'Placeholder';
	export let type: 'file' | 'folder' = 'file';
	export let size;
	export let children: fs.FileEntry[] = undefined;
	export let click = () => {};

	interface File extends fs.FileEntry {
		size: number;
	}
</script>

{#if type === 'file'}
	<div
		class="first-letter:font-bold font-light p-2 w-11/12 text-xs opacity-100 bg-gray-500 hover:scale-105 transition-all "
		id="FILE"
		on:click|stopPropagation={click}
	>
		<div class="font-semibold break-words">
			{name} / {size} bytes
		</div>
	</div>
{:else}
	<div class="first-letter:font-bold font-light p-2 w-11/12 text-xs bg-yellow-500" id="FILE">
		<div class="font-semibold break-words">
			{name}
		</div>
	</div>
{/if}

<style>
	@import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap');
	#FILE {
		font-family: 'Rubik', sans-serif;
	}
</style>
