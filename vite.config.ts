import {defineConfig} from 'vite';

export default defineConfig({
    build: {
        sourcemap: true,
        lib: {
            entry: 'src/yuppee.ts',
            name: 'Yuppee',
        }
    }
})
