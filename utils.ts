export function deepEquals(a: unknown, b: unknown): boolean {
    if (!a || !b) return a === b;
    if (typeof a !== typeof b) return false;
    if (Array.isArray(a)) {
        if (a.length !== (b as typeof a).length) return false;
        for (let i = 0; i < a.length; i++) {
            if (!deepEquals(a[i], (b as typeof a)[i])) {
                return false;
            }
        }
        return true;
    } else if (typeof a === 'object') {
        for (const k of Object.keys(a)) {
            if (!deepEquals(a[k as keyof typeof a], b[k as keyof typeof b])) {
                return false;
            }
        }
        return true;
    } else return a === b;
}

export function debounce<P extends any[]>(
    f: (...args: P) => void,
    time: number
) {
    let timeoutId: number;
    return function (...args: P) {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => f(...args), time);
    };
}

export function noop() {}

export function throttle<P extends any[]>(
    fn: (...args: P) => void,
    initialLimitMs: number,
    id?: string
) {
    let start = Date.now();
    let offenders: Map<string, number>, limitPerOffenders: Map<string, number>;

    if (id) {
        offenders = new Map<string, number>();
        limitPerOffenders = new Map<string, number>();
        offenders.set(id, 0);
        limitPerOffenders.set(id, initialLimitMs);
    }

    return function (...args: P) {
        const current = Date.now();
        const limit = limitPerOffenders?.get(id ?? '') ?? initialLimitMs;

        if (current - start > limit) {
            fn(...args);
            start = current;
        } else if (id) {
            offenders!.set(id, offenders!.get(id)! + 1);
            limitPerOffenders!.set(id, limitPerOffenders.get(id)! + 100);
        }
    };
}
