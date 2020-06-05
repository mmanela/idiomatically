export function escapeRegex(str: string): string {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};


export async function sleep(time: number) {
    await new Promise(resolve => setTimeout(resolve, time));
}