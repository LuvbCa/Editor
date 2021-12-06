<script lang="ts">
	//weh
	import { createEventDispatcher } from 'svelte';

	export let line: EditorLine;
	export let index: number;

	const dispatch = createEventDispatcher<{
		key: KeyboardEvent & {
			currentTarget: EventTarget & HTMLDivElement;
		};
	}>();

	let highlighted = false;
</script>

<div
	id="line-index-{index}"
	class="w-full"
	on:keydown|stopPropagation={(e) => {
		dispatch('key', e);
	}}
	data-line={index}
	data-indent={line.indent}
>
	<span
		class="inline-block w-10 select-none {highlighted ? 'opacity-100 text-blue-400' : 'opacity-30'}"
	>
		{index}
	</span>
	<span
		contenteditable="true"
		spellcheck="false"
		style="margin-left: {line.indent * 2}em;"
		class="active:border-none focus-visible:outline-none content select-text"
		id="line-index-editable-{index}"
	>
		{line.text}
		{#if line.styling}
			color
		{/if}
	</span>
</div>

<style>
	/* .content {
		all: unset;
	} */
</style>
