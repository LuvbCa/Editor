<script lang="ts">
	import type { Text, LowlightElementSpan } from 'lowlight/lib/core';

	export let input: (Text | LowlightElementSpan)[];
	export let css: string[] = [];

	const isText = (inputT: Text | LowlightElementSpan): inputT is Text => {
		return inputT.type == 'text';
	};
</script>

<span>
	{#each input as cInput}
		{#if isText(cInput)}
			<span style="margin-left: {cInput.value.split('\t').length - 1}em;" class={css}
				>{@html cInput.value.replace('\r\n', '<br>')}</span
			>
		{:else}
			<svelte:self css={cInput.properties.className} input={cInput.children} />
		{/if}
	{/each}
</span>

<style>
</style>
