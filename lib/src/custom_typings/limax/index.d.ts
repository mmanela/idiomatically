declare module 'twemoji-parser' {
    interface ParseOptions {
        assertType?: "png"| "svg"
    }

    interface ParseResult {
        url: string,
        indices: number[],
        text: string,
        type: string
    }

    export function parse(input: string, options?: ParseOptions): ParseResult[];
}