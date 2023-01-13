/* Every schema hast to implement this interface. */
export interface MigratableState<TVersion extends number = number> {
    version: TVersion;
}

/* Specifies a single migration from one version to another. */
export interface Migration<
    TFrom extends MigratableState,
    TTo extends MigratableState
> {
    /* Version to migrate from */
    from: TFrom['version'];

    /* Version to migrate to */
    to: TTo['version'];

    /* Migration function */
    migrate(from: Readonly<TFrom>): Omit<TTo, 'version'>;
}
