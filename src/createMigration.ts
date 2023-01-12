import {MigratableState, Migration} from './types';

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
