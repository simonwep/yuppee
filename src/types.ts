/* Every schema hast to implement this interface. */
export type MigratableState = { version: number };

/* Specifies a single migration from one version to another. */
export interface Migration<
    From extends MigratableState,
    To extends MigratableState
> {
    /* Version to migrate from */
    from: From['version'];

    /* Version to migrate to */
    to: To['version'];

    /* Migration function */
    migrate(from: From): To;
}
