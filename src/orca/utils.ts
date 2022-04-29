export function assert(condition: unknown, message = ''): asserts condition {
    if (!condition) {
        throw new Error(message);
    }
}

export function extractParameter<T>(v: T | T[]): T {
    if (Array.isArray(v)) {
        return v[0];
    }

    return v;
}
