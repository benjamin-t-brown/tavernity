import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import { readdirSync } from 'fs';

const absolutePathAliases: Record<string, string> = {};

export default defineConfig((...args) => {
  const rootPath = './';

  const srcPath = path.resolve('./src/');
  const srcRootContent = readdirSync(srcPath, { withFileTypes: true }).map(
    (dirent) => dirent.name.replace(/(\.ts){1}(x?)/, '')
  );

  srcRootContent.forEach((directory) => {
    absolutePathAliases[directory] = path.join(srcPath, directory);
  });

  const config = {
    plugins: [
      tsconfigPaths({
        projects: [rootPath + 'tsconfig.vitest.json'],
      }),
    ],
    resolve: {
      alias: {
        src: path.resolve('src/'),
        ...absolutePathAliases,
      },
    },
    test: {
      environment: 'happy-dom',
      setupFiles: ['test/setup.ts'],
      reporters: 'default',
      coverage: {
        provider: 'c8',
        reporter: ['text-summary', 'lcov'],
        exclude: ['test/*'],
      },
    },
    directory: 'test',
    root: '.',
    esbuild: {
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
      // pure: ['console.log', 'console.debug', 'console.warn'],
    },
    // exclude: [...configDefaults.exclude, '**/rpgscript-vscode-linter/**'],
  };
  return config as any;
});
