/* Every schema hast to implement this interface. */
export type MigratableState<Version extends number = number> = {
    version: Version;
};

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
