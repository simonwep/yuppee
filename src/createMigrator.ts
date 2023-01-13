import {MigratableState, Migration} from './types';

type NeverOr<V, D> = [V] extends ([never] | []) ? D : V;

export type ExtractFinalState<T extends MigratableState, M extends Migration<any, any>[]> = NeverOr<{
    [K in keyof M as 'last']: ReturnType<M[K]['migrate']>;
}['last'], T>;

export type ExtractFromStates<T extends MigratableState, M extends Migration<any, any>[]> =
    NeverOr<Parameters<M[number]['migrate']>[0], T>;

export interface MigratorOptions<T extends MigratableState, M extends Migration<any, any>[]> {
    migrations?: M;
    init(): T;
}

/**
 * Takes an array of migration functions and returns a function to migrate an
 * old version of your state to the newest one.
 * @param options Migration configuration.
 */
export const createMigrator = <T extends MigratableState, M extends Migration<any, any>[] = never>({migrations, init}: MigratorOptions<T, M>) => {
    const highestVersion = migrations ? Math.max(...migrations.map((v) => v.to)) : undefined;

    return (
        data: ExtractFromStates<T, M> | ExtractFinalState<T, M> = init()
    ): ExtractFinalState<T, M> => {
        const sourceVersion = (data as MigratableState).version;
        const targetVersion = highestVersion ?? sourceVersion;

        if (sourceVersion > targetVersion) {
            throw new Error(`Cannot process state with version ${sourceVersion}, highest known version is ${targetVersion}`);
        } else if (sourceVersion === targetVersion) {
            return data as ExtractFinalState<T, M>;
        }

        let result: any = data;
        for (let i = sourceVersion; i < targetVersion;) {
            const fn = migrations
                ?.filter((m) => m.from === i && m.to > i)
                .sort((a, b) => a.to > b.to ? -1 : 1)
                .at(0);

            if (fn) {
                result = fn.migrate(result);
                i = fn.to;
            } else {
                throw new Error(`Migration from v${i} to v${i + 1} missing`);
            }
        }

        return result;
    };
};
