export function debounce(func: () => void, wait: number): () => void {
    let timeoutId: number;
    return () => {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(func, wait);
    };
}