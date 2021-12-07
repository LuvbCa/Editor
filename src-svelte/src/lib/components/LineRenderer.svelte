<script lang="ts">
	import { onMount } from 'svelte';

	export let line: MetaLine;
	export let index: number;

	let highlighted = false;

	const constructBlocks = () => {
		const rawText = line.render.text;
	};
</script>

<div
	id="line-index-{index}"
	class="w-full"
	on:keydown|stopPropagation
	data-line={index}
	data-indent={line.render.indent}
>
	<span
		class="inline-block w-10 select-none {highlighted ? 'opacity-100 text-blue-400' : 'opacity-30'}"
	>
		{index}
	</span>
	<span
		contenteditable="true"
		spellcheck="false"
		style="margin-left: {line.render.indent * 2}em;"
		class="active:border-none focus-visible:outline-none content select-text"
		id="line-index-editable-{index}"
	>
		{#each blocks as block}
			<span>
				{block + ' '}
			</span>
		{/each}
	</span>
</div>

<style>
	/* .content {
		all: unset;
	} */
</style>
