import {defineConfig} from 'vite';
import {version} from './package.json'

export default defineConfig({
    build: {
        sourcemap: true,
        lib: {
            entry: 'src/index.ts',
            name: 'Migrato',
        }
    },

    define: {
        'import.meta.env.VERSION': version
    }
})
