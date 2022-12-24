import {expect, test} from 'vitest';
import {createMigration, createMigrator} from './index';

type StateV1 = { version: 1, name: string };
type StateV2 = { version: 2, names: string[] };
type StateV3 = { version: 3, data: { names: string[] } };

test('Migrate a simple state', () => {
    const migrate = createMigrator([
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
    ]);

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
    const migrate = createMigrator([
        createMigration<StateV1, StateV2>({
            from: 1,
            to: 2,
            migrate: () => {
                throw new Error('Not implemented.')
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
    ]);

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
    const migrate = createMigrator([
        createMigration<StateV1, StateV2>({
            from: 1,
            to: 2,
            migrate: (from) => ({
                version: 2,
                names: [from.name]
            })
        })
    ]);

    expect(() =>
        migrate({
            version: 3
        } as any)
    ).toThrow();
});

test('Perform no transformation if version is already the highest', () => {
    const migrate = createMigrator([
        createMigration<StateV1, StateV2>({
            from: 1,
            to: 2,
            migrate: (from) => ({
                version: 2,
                names: [from.name]
            })
        })
    ]);

    const data = {
        version: 2,
        names: ['foo']
    };

    expect(migrate(data as any)).toEqual(data);
});
