import { resolve } from 'path'

export default {
    root: './',
    base: './',
    server: {
        host: true
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                scene: resolve(__dirname, 'scene.html'),
                forest: resolve(__dirname, 'forest.html')
            }
        }
    }
}
