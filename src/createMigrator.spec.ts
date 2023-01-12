import {expect, test} from 'vitest';
import {createMigration, createMigrator} from './index';

type StateV1 = {version: 1, name: string};
type StateV2 = {version: 2, names: string[]};
type StateV3 = {version: 3, data: {names: string[]}};

test('Example in README', () => {
    type StateV1 = {version: 1, name?: string};
    type StateV2 = {version: 2, names: string[]};
    type StateV3 = {version: 3, data: {names: string[]}};

    const migrate = createMigrator({
        init: (): StateV1 => ({version: 1, name: 'baz'}),
        migrations: [
            createMigration<StateV1, StateV2>({
                from: 1,
                to: 2,
                migrate: (state) => ({
                    version: 2,
                    names: state.name ? [state.name] : []
                })
            }),
            createMigration<StateV2, StateV3>({
                from: 2,
                to: 3,
                migrate: (state) => ({
                    version: 3,
                    data: {names: state.names}
                })
            })
        ]
    });

    expect(migrate()).toEqual({version: 3, data: {names: ['baz']}});

    expect(
        migrate({version: 1, name: 'foo'})
    ).toEqual({version: 3, data: {names: ['foo']}});

    expect(
        migrate({version: 2, names: ['bar', 'bam']})
    ).toEqual({version: 3, data: {names: ['bar', 'bam']}});
});

test('Initialize', () => {
    const migrate = createMigrator({
        init: (): StateV1 => ({version: 1, name: 'foo'})
    });

    expect(migrate()).toEqual({
        version: 1,
        name: 'foo'
    });
});

test('Migrate init', () => {
    const migrate = createMigrator({
        init: (): StateV1 => ({version: 1, name: 'bar'}),
        migrations: [
            createMigration<StateV1, StateV2>({
                from: 1,
                to: 2,
                migrate: (from) => ({
                    version: 2,
                    names: [from.name]
                })
            }),
            createMigration<StateV2, StateV3>({
                from: 2,
                to: 3,
                migrate: (from) => ({
                    version: 3,
                    data: {names: from.names}
                })
            })
        ]
    });

    expect(
        migrate()
    ).toEqual({
        version: 3,
        data: {names: ['bar']}
    });
});

test('Migrate a simple state', () => {
    const migrate = createMigrator({
        init: (): StateV1 => ({version: 1, name: 'bar'}),
        migrations: [
            createMigration<StateV1, StateV2>({
                from: 1,
                to: 2,
                migrate: (from) => ({
                    version: 2,
                    names: [from.name]
                })
            }),
            createMigration<StateV2, StateV3>({
                from: 2,
                to: 3,
                migrate: (from) => ({
                    version: 3,
                    data: {names: from.names}
                })
            })
        ]
    });

    expect(
        migrate({
            version: 1,
            name: 'foo'
        })
    ).toEqual({
        version: 3,
        data: {names: ['foo']}
    });
});

test('Pick most efficient migration function', () => {
    const migrate = createMigrator({
        init: (): StateV1 => ({version: 1, name: 'bar'}),
        migrations: [
            createMigration<StateV1, StateV2>({
                from: 1,
                to: 2,
                migrate: () => {
                    throw new Error('Not implemented.');
                }
            }),
            createMigration<StateV1, StateV3>({
                from: 1,
                to: 3,
                migrate: (from) => ({
                    version: 3,
                    data: {names: [from.name]}
                })
            })
        ]
    });

    expect(
        migrate({
            version: 1,
            name: 'foo'
        })
    ).toEqual({
        version: 3,
        data: {names: ['foo']}
    });
});

test('Throw error if the version to migrate is too high', () => {
    const migrate = createMigrator({
        init: (): StateV1 => ({version: 1, name: 'bar'}),
        migrations: [
            createMigration<StateV1, StateV2>({
                from: 1,
                to: 2,
                migrate: (from) => ({
                    version: 2,
                    names: [from.name]
                })
            })
        ]
    });

    expect(() =>
        migrate({
            version: 3
        } as any)
    ).toThrow();
});

test('Throw error if a migration is missing', () => {
    const migrate = createMigrator({
        init: (): StateV1 => ({version: 1, name: 'bar'}),
        migrations: [
            createMigration<StateV2, StateV3>({
                from: 2,
                to: 3,
                migrate: (from) => ({
                    version: 3,
                    data: {names: from.names}
                })
            })
        ]
    });

    expect(() =>
        migrate({
            version: 1
        } as any)
    ).toThrow();
});

test('Perform no transformation if version is already the highest', () => {
    const migrate = createMigrator({
        init: (): StateV1 => ({version: 1, name: 'bar'}),
        migrations: [
            createMigration<StateV1, StateV2>({
                from: 1,
                to: 2,
                migrate: (from) => ({
                    version: 2,
                    names: [from.name]
                })
            })
        ]
    });

    const data = {
        version: 2,
        names: ['foo']
    };

    expect(migrate(data as any)).toEqual(data);
});
