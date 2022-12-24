import {MigratableState, Migration} from './types';

type ExtractFinalState<M extends Migration<any, any>[]> = {
    [K in keyof M as 'last']: ReturnType<M[K]['migrate']>;
}['last'];

type ExtractFromStates<M extends Migration<any, any>[]> = {
    [K in keyof M]: Parameters<M[K]['migrate']>[0];
}[keyof M];

/**
 * Type-safe utility to create a new migration.
 * This way it is ensured that the correct from / to numbers are used and
 * returned in the migrate function.
 * @param cfg Migration configuration.
 */
export const createMigration = <
    From extends MigratableState,
    To extends MigratableState
>(cfg: Migration<From, To>) => cfg;

/**
 * Takes an array of migration functions and returns a function to migrate an
 * old version of your state to the newest one.
 * @param migrations Migrations created with `createMigration`.
 */
export const createMigrator = <M extends Migration<any, any>[]>(migrations: M) => {
    const targetVersion = Math.max(...migrations.map((v) => v.to));

    return (data: ExtractFromStates<M> | ExtractFinalState<M>): ExtractFinalState<M> => {
        const sourceVersion = (data as MigratableState).version;

        if (sourceVersion > targetVersion) {
            throw new Error(`Cannot process state with version ${sourceVersion}, highest known version is ${targetVersion}`);
        } else if (sourceVersion === targetVersion) {
            return data as ExtractFinalState<M>;
        }

        let result: any = data;
        for (let i = sourceVersion; i < targetVersion; ) {
            const fn = migrations
                .filter((m) => m.from === i && m.to > i)
                .sort((a, b) => a.to > b.to ? -1 : 1)
                .at(0)

            if (fn) {
                result = fn.migrate(result)
                i = fn.to;
            } else {
                throw new Error(`Migration from v${i} to v${i + 1} missing`);
            }
        }

        return result;
    };
};
