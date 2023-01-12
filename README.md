<br/>

<h3 align="center">
    Type-Safe migration utility to migrate from one data-schema to another.
</h3>

<br/>

<p align="center">
    <a href="https://choosealicense.com/licenses/mit/"><img
        alt="License MIT"
        src="https://img.shields.io/badge/license-MIT-ae15cc.svg"></a>
    <img alt="No dependencies"
        src="https://img.shields.io/badge/dependencies-none-8115cc.svg">
    <a href="https://github.com/sponsors/Simonwep"><img
        alt="Support me"
        src="https://img.shields.io/badge/github-support-6a15cc.svg"></a>
    <img alt="version" src="https://img.shields.io/npm/v/migrato?color=%233d24c9&label=version">
    <a href="https://www.buymeacoffee.com/aVc3krbXQ"><img
        alt="Buy me a coffee"
        src="https://img.shields.io/badge/%F0%9F%8D%BA-buy%20me%20a%20beer-%23FFDD00"></a>
    <a href="https://github.com/Simonwep/migrato/actions?query=workflow%3ACI"><img
        alt="Build Status"
        src="https://github.com/Simonwep/migrato/actions/workflows/main.yml/badge.svg"></a>
    <img alt="gzip size" src="https://img.badgesize.io/https://cdn.jsdelivr.net/npm/migrato?compression=gzip">
    <img alt="brotli size" src="https://img.badgesize.io/https://cdn.jsdelivr.net/npm/migrato?compression=brotli">
</p>

### Summary

This is a small package to facilitate the transition from one data-structure to another.
It may be useful if you have settings or very little state that is stored as a single JSON-Object that needs to be migrated to another schema at some point.

### Usage

Install it using your preferred package manager (taking npm as example):

```shell
npm install migrato
```

```ts
import { createMigration, createMigrator } from 'migrato';

// All possible versions your clients may have.
type StateV1 = { version: 1, name?: string };
type StateV2 = { version: 2, names: string[] };
type StateV3 = { version: 3, data: { names: string[] } };

// This is the type that should be used throughout your app.
// It's an alias to the latest version and can be re-mapped on every update.
type State = StateV3;

const migrate = createMigrator({
    init: (): StateV1 => ({ version: 1, name: 'baz' }),
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
                data: { names: state.names }
            })
        })
    ]
});

/* Logs { version: 3, data: { names: ['baz'] } } */
console.log(migrate());

/* Logs { version: 3, data: { names: ['foo'] } } */
console.log(migrate({ version: 1, name: 'foo' }));

/* Logs { version: 3, data: { names: ['bar', 'bam'] } } */
console.log(migrate({ version: 2, names: ['bar', 'bam'] }));
```
