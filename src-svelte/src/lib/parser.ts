export class JsParser {
	static keywords = [
		'await',
		'break',
		'case',
		'catch',
		'class',
		'const',
		'continue',
		'debugger',
		'default',
		'delete',
		'do',
		'else',
		'enum',
		'export',
		'extends',
		'false',
		'finally',
		'for',
		'function',
		'if',
		'implements',
		'import',
		'in',
		'instanceof',
		'interface',
		'let',
		'new',
		'null',
		'package',
		'private',
		'protected',
		'public',
		'return',
		'super',
		'switch',
		'static',
		'this',
		'throw',
		'try',
		'true',
		'typeof',
		'var',
		'void',
		'while',
		'with',
		'yield'
	];
	static parseWord(input: string): string {
		if (this.keywords.includes(input)) {
			return "<p style='color: red'>" + input + '</p>';
		}
		return input;
	}
}
