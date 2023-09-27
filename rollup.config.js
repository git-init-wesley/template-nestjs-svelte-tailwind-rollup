import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import * as child_process from 'child_process';
import livereload from 'rollup-plugin-livereload';
import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/svelte/main.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/build/bundle.js',
  },
  plugins: [
    svelte({
      preprocess: [],
      emitCss: false,
      compilerOptions: {
        dev: !production,
      },
    }),
    resolve({
      browser: true,
      dedupe: ['svelte'],
    }),
    commonjs(),
    tailwind(),
    production && buildApi(),
    !production && serve(),
    !production && livereload('public'),
    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
};

function tailwind() {
  return {
    writeBundle() {
      child_process.spawn('npm', ['run', 'tailwind'], {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true,
      });
    },
  };
}

function buildApi() {
  return {
    writeBundle() {
      child_process.spawn('npm', ['run', 'build:api'], {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true,
      });
    },
  };
}

function serve() {
  let server;

  function toExit() {
    if (server) server.kill();
  }

  return {
    writeBundle() {
      if (server) return;
      const cmd = production ? 'build:api' : 'start:dev';
      server = child_process.spawn('npm', ['run', cmd], {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true,
      });
      process.on('SIGTERM', toExit);
      process.on('exit', toExit);
    },
  };
}
