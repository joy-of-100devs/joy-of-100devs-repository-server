export interface CacheOptions {
    revalidate?: number;
}

interface CacheEntry<T> {
    value: T,
    updatedAt: Date,
}

export function cache<T>(func: (arg: string) => T, options: CacheOptions = {}) {
    const revalidate = options?.revalidate ?? 300;
    const cache: Record<string, CacheEntry<T>|undefined> = {};

    return function cached(arg: string) {
        const cachedEntry = cache[arg];
        if (cachedEntry && (+new Date() - +cachedEntry.updatedAt) <= revalidate * 1000) {
            return cachedEntry.value;
        }
        const result = func(arg);
        cache[arg] = {
            updatedAt: new Date(),
            value: result,
        };
        return result;
    }
}
