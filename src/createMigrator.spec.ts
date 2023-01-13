import {expect, test} from 'vitest';
import {createMigration, createMigrator} from './index';

type StateV1 = { version: 1, name: string };
type StateV2 = { version: 2, names: string[] };
type StateV3 = { version: 3, data: { names: string[] } };

type State = StateV3;

test('Example in README', () => {
    type StateV1 = { version: 1, name?: string };
    type StateV2 = { version: 2, names: string[] };
    type StateV3 = { version: 3, data: { names: string[] } };

    type State = StateV3;

    const migrate = createMigrator<State, StateV1 | StateV2>({
        init: () => ({name: 'baz'}),
        migrations: [
            createMigration<StateV1, StateV2>({
                from: 1,
                to: 2,
                migrate: (state) => ({
                    names: state.name ? [state.name] : []
                })
            }),
            createMigration<StateV2, StateV3>({
                from: 2,
                to: 3,
                migrate: (state) => ({
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
    const migrate = createMigrator<StateV1>({
        init: () => ({version: 1, name: 'foo'})
    });

    const result: StateV1 = migrate();
    expect(result).toEqual({
        version: 1,
        name: 'foo'
    });
});

test('Migrate init', () => {
    const migrate = createMigrator<State, StateV1 | StateV2>({
        init: () => ({name: 'foo'}),
        migrations: [
            createMigration<StateV1, StateV2>({
                from: 1,
                to: 2,
                migrate: (from) => ({
                    names: [from.name]
                })
            }),
            createMigration<StateV2, StateV3>({
                from: 2,
                to: 3,
                migrate: (from) => ({
                    data: {names: from.names}
                })
            })
        ]
    });

    const result: StateV3 = migrate();
    expect(result).toEqual({
        version: 3,
        data: {names: ['foo']}
    });
});

test('Migrate a simple state', () => {
    const migrate = createMigrator<State, StateV1 | StateV2>({
        init: () => ({name: 'foo'}),
        migrations: [
            createMigration<StateV1, StateV2>({
                from: 1,
                to: 2,
                migrate: (from) => ({
                    names: [from.name]
                })
            }),
            createMigration<StateV2, StateV3>({
                from: 2,
                to: 3,
                migrate: (from) => ({
                    data: {names: from.names
                }})
            })
        ]
    });

    const result: StateV3 = migrate({
        version: 1,
        name: 'foo'
    })

    expect(result).toEqual({
        version: 3,
        data: {names: ['foo']}
    });
});

test('Pick most efficient migration function', () => {
    const migrate = createMigrator<State, StateV1 | StateV2>({
        init: () => ({name: 'foo'}),
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
                    data: {names: [from.name]}
                })
            })
        ]
    });

    const result: StateV3 = migrate({version: 1, name: 'foo'});
    expect(result).toEqual({
        version: 3,
        data: {names: ['foo']}
    });
});

test('Throw error if the version to migrate is too high', () => {
    const migrate = createMigrator<State, StateV1 | StateV2>({
        init: () => ({name: 'foo'}),
        migrations: [
            createMigration<StateV1, StateV2>({
                from: 1,
                to: 2,
                migrate: (from) => ({
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
    const migrate = createMigrator<State, StateV1 | StateV2>({
        init: () => ({name: 'foo'}),
        migrations: [
            createMigration<StateV2, StateV3>({
                from: 2,
                to: 3,
                migrate: (from) => ({
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
    const migrate = createMigrator<State, StateV1 | StateV2>({
        init: () => ({name: 'foo'}),
        migrations: [
            createMigration<StateV1, StateV2>({
                from: 1,
                to: 2,
                migrate: (from) => ({
                    names: [from.name]
                })
            })
        ]
    });

    const data = {
        version: 2,
        names: ['bar']
    };

    expect(migrate(data as any)).toEqual(data);
});
