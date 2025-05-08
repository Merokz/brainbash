import { Prisma, PrismaClient } from '@prisma/client';

/**
 * Simple in-memory cache with TTL and wildcard deletion support.
 */
interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}

export class MemoryCache {
    private store = new Map<string, CacheEntry<any>>();

    constructor(private defaultTtlSeconds = 600) {}

    async get<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttlSeconds?: number,
    ): Promise<T> {
        const now = Date.now();
        const entry = this.store.get(key);
        if (entry && entry.expiresAt > now) {
            console.log(`[cache] HIT key=${key}`);
            return entry.value;
        }
        console.log(`[cache] MISS key=${key}`);
        const result = await fetcher();
        this.set(key, result, ttlSeconds);
        return result;
    }

    set<T>(key: string, value: T, ttlSeconds?: number) {
        const ttl = ttlSeconds ?? this.defaultTtlSeconds;
        const expiresAt = Date.now() + ttl * 1000;
        this.store.set(key, { value, expiresAt });
    }

    async delete(pattern: string) {
        // support wildcard suffix, e.g. "User:123*"
        const isWildcard = pattern.endsWith('*');
        const prefix = isWildcard ? pattern.slice(0, -1) : pattern;
        for (const key of Array.from(this.store.keys())) {
            if (
                (isWildcard && key.startsWith(prefix)) ||
                (!isWildcard && key === prefix)
            ) {
                console.log(`[cache] DELETE key=${key}`);
                this.store.delete(key);
            }
        }
    }
}

const OP_FIND_FIRST = 'findFirst';
const OP_FIND_UNIQUE = 'findUnique';
const OP_UPDATE = 'update';
const OP_DELETE = 'delete';

const DEFAULT_CACHEABLE_MODELS = ['Quiz', 'User', 'Question', 'Answer'];
// define how to key manage fields per model
const CACHE_KEY_FIELDS: Record<string, string> = {
    Quiz: 'id',
    User: 'id',
    Question: 'id',
    Answer: 'id',
};

function stableStringify(obj: any): string {
    if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
    if (Array.isArray(obj))
        return '[' + obj.map(stableStringify).join(',') + ']';
    const keys = Object.keys(obj).sort();
    return (
        '{' +
        keys
            .map((k) => JSON.stringify(k) + ':' + stableStringify(obj[k]))
            .join(',') +
        '}'
    );
}

function generateUniqueKey(args: any) {
    return stableStringify(args);
}

export const cacheClient = new MemoryCache(60);

export const cacheExtension = Prisma.defineExtension({
    name: 'cache',
    query: {
        $allModels: {
            async $allOperations({ model, operation, args, query }) {
                if (!DEFAULT_CACHEABLE_MODELS.includes(model)) {
                    return query(args);
                }
                const keyField = CACHE_KEY_FIELDS[model];
                const where = (args as any)?.where;

                // on read ops
                if (
                    (operation === OP_FIND_FIRST ||
                        operation === OP_FIND_UNIQUE) &&
                    where &&
                    where[keyField] != null
                ) {
                    const fieldValue = String(where[keyField]);
                    const key = `${model}:${fieldValue}:${generateUniqueKey(args)}`;
                    return cacheClient.get(key, () => query(args));
                }

                // on write ops
                if (operation === OP_UPDATE || operation === OP_DELETE) {
                    // ensure keyField is selected
                    args.select = {
                        ...(args.select ?? {}),
                        [keyField]: true,
                    };
                    const result: any = await query(args);
                    const id = result?.[keyField];
                    if (id != null) {
                        // invalidate all variants for this record
                        await cacheClient.delete(`${model}:${id}*`);
                    }
                    return result;
                }

                // fallback
                return query(args);
            },
        },
    },
});

export const cacheConfig = {
    name: 'cache',
    clientExtension: cacheExtension,
};
