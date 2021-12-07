<script lang="ts">
	import { onMount } from 'svelte';

	export let line: MetaLine;
	export let index: number;

	let highlighted = false;

	const constructBlocks = () => {
		const blocks: {
			text: string;
			style: string;
		}[] = [];
		const rawText = line.render.text;
		const syntax = line.syntax;

		for (let i = 0; i < syntax.length; i++) {
			const element = syntax[i];

			blocks.push({
				text: element.text,
				style: ''
			});
		}

		return blocks;
	};

	const blocks = constructBlocks();
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
		class="active:border-none focus-visible:outline-none select-text"
		id="line-index-editable-{index}"
	>
		{#each blocks as block}
			<span style={block.style}>{block.text}</span>
		{/each}
	</span>
</div>

<style>
	/* .content {
		all: unset;
	} */
</style>
