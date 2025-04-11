export function unescapeRegExp(str: string): string {
    return str.replace(/\\([.*+?^${}()|[\]\\])/g, '$1');
}

export function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}