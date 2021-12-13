<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { currentFile } from './store';

	import Parser, { init, Language, SyntaxNode, Tree } from 'web-tree-sitter';
	import LineRenderer from './components/LineRenderer.svelte';
	import Tab from './components/Tab.svelte';

	let RenderLines: EditorLine[] = [];
	let SyntaxLines: SyntaxLine[] = [];

	let MergedLines: MetaLine[] = [];

	/**
	 * algorithm for coloring:
	 * 1. construct inital syntax tree based on read content
	 * 2. construct Renderlines with all needed meta-data from this syntax Tree
	 * 3. render the RenderLines according to this Data
	 * 4. on Keydown event figure out which element is selected and add character on the right place
	 * 5. reparse the tree and update needed Lines
	 */

	const readFile = async (path: string) => {
		const initialtext = await window.fs.readFile(path);
		const initialTree = await initialParse(initialtext);

		const renderLines = await constructRenderLines(initialtext);

		const syntaxLines = Array.from<any, SyntaxLine[]>({ length: renderLines.length }, () => []);
		await constructSyntaxLines(initialTree.rootNode, syntaxLines);

		MergedLines = await mergeRenderAndSyntaxLines(renderLines, syntaxLines);
	};

	const handleInputs: svelte.JSX.KeyboardEventHandler<HTMLDivElement> = async (event) => {
		const e = event;

		const newLineNumber = parseInt((e.composedPath()[1] as HTMLElement).dataset.line);
		const cursor = window.getSelection();
		RenderLines[newLineNumber].text = document.getElementById(
			`line-index-editable-${newLineNumber}`
		).innerText;
		RenderLines = RenderLines;

		if (e.key == 'Enter') {
			//stop linebreak
			e.preventDefault();

			const prevElement = RenderLines[newLineNumber];
			const cursor = window.getSelection();

			const newLineText = prevElement.text.slice(cursor.anchorOffset, prevElement.text.length);
			const newOldLineText = prevElement.text.slice(0, cursor.anchorOffset);

			prevElement.text = newOldLineText;

			RenderLines.splice(newLineNumber + 1, 0, {
				text: newLineText,
				indent: 0,
				uuid: NoReUUID()
			});

			RenderLines = [...RenderLines];

			await tick();

			const newLine = document.getElementById('line-index-editable-' + (newLineNumber + 1));
			const range = document.createRange();

			range.setStart(newLine, 1);
			range.collapse(true);

			cursor.removeAllRanges();
			cursor.addRange(range);

			console.log(cursor);

			return;
		}
		if (e.key === 'Backspace' && cursor.focusOffset + cursor.anchorOffset === 0) {
			e.preventDefault();
			const indent = parseInt((e.composedPath()[1] as HTMLElement).dataset.indent);

			if (indent === 0) {
				const lineText = RenderLines[newLineNumber].text;
				const newCursorPosition = RenderLines[newLineNumber - 1].text.length;
				RenderLines[newLineNumber - 1].text += lineText;

				const linesFront = RenderLines.slice(0, newLineNumber);
				const linesBehind = RenderLines.slice(newLineNumber + 1, -1);

				RenderLines = linesFront.concat(linesBehind);

				await tick();

				const newLine = document.getElementById('line-index-editable-' + (newLineNumber - 1));

				cursor.setPosition(newLine, 0);
				for (let i = 0; i < newCursorPosition; i++) {
					//@ts-ignore not in typescript?
					cursor.modify('move', 'right', 'character');
				}
			} else {
				RenderLines[newLineNumber].indent--;
				RenderLines = RenderLines;
			}
			return;
		}
		if (e.key === 'Tab') {
			//check tab event as it skips to the next line by default?
			e.preventDefault();

			RenderLines[newLineNumber].indent++;
			RenderLines = RenderLines;

			return;
		}
		if (e.key.startsWith('Arrow')) {
			switch (e.key) {
				case 'ArrowUp': {
					e.preventDefault();
					const newLineNumberDown = newLineNumber - 1;
					const el = document.getElementById(`line-index-editable-${newLineNumberDown}`);
					if (newLineNumberDown >= 0) cursor.setPosition(el, 0);
					break;
				}

				case 'ArrowDown':
					e.preventDefault();
					const newLineNumberUp = newLineNumber + 1;
					const el = document.getElementById(`line-index-editable-${newLineNumberUp}`);
					if (newLineNumberUp < RenderLines.length) cursor.setPosition(el, 0);
					break;
			}
		}
	};

	const uuid = () => Math.random() * Math.random() * 100;

	//faster then convertTextToLines 40x - 120x ==> from 40ms to almost 0ms woah
	const constructRenderLines = async (text: string): Promise<EditorLine[]> => {
		const lines: EditorLine[] = [];
		const matches = [...text.matchAll(/\r\n/g)];

		for (let i = 0; i < matches.length; i++) {
			const element = matches[i];
			const prevElement = matches.at(i - 1);

			const slicedInput = element.input.slice(prevElement ? prevElement.index : 0, element.index);

			const tabs = [...slicedInput.matchAll(/\t/g)].length;
			const sanitizedSlicedInput = slicedInput.replaceAll('\r\n', '').replaceAll('\t', '');

			lines.push({
				indent: tabs,
				text: sanitizedSlicedInput
			});
		}
		return lines;
	};

	const constructSyntaxLines = async (node: SyntaxNode, lines: SyntaxLine[][]) => {
		if (node.isNamed()) {
			const { type, endPosition, startPosition, text } = node;

			console.log(node.startIndex, node.endIndex);
			lines[startPosition.row].push({ type, endPosition, startPosition, text });
		}

		for (const child of node.children) {
			constructSyntaxLines(child, lines);
		}
	};

	const mergeRenderAndSyntaxLines = async (
		renderLines: EditorLine[],
		syntaxLines: SyntaxLine[][]
	): Promise<MetaLine[]> => {
		if (renderLines.length !== syntaxLines.length)
			throw new Error('different sized render and syntax lines cannot continue to read');

		const merged: MetaLine[] = [];
		for (let i = 0; i < renderLines.length; i++) {
			const render = renderLines[i];
			const syntax = syntaxLines[i];

			merged.push({
				render,
				syntax,
				uuid: uuid()
			});
		}
		return merged;
	};

	const initialParse = async (content: string) => {
		await Parser.init();
		const [JavaScript, TypeScript] = await Promise.all([
			Parser.Language.load('tree-sitter-javascript.wasm'),
			Parser.Language.load('tree-sitter-typescript.wasm')
		]);

		const parser = new Parser();
		parser.setLanguage(TypeScript);

		return parser.parse(content);
	};

	$: readFile($currentFile);
</script>

<div id="editor" class="pl-2 w-full h-full bg-gray-700 text-white overflow-y-scroll">
	{#each MergedLines as line, index (line.uuid)}
		<LineRenderer on:keydown={handleInputs} {line} {index} />
	{/each}
</div>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
	<link
		href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<style>
	div {
		font-family: Fira Code;
	}

	#editor::-webkit-scrollbar {
		@apply bg-transparent;
		width: 10px;
	}
	#editor::-webkit-scrollbar-thumb {
		@apply bg-white;
		@apply bg-opacity-10;
		border-radius: 0.5em;
		width: 5px;
	}
</style>
