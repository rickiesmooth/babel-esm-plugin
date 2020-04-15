import test from 'ava';
import { getCompiler, defaultConfig, runWebpack } from '../webpack-utils';
import * as fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

test('es5 target is being tested', t => {
  t.pass();
});

// {
//   test: /\.(js|mjs)$/,
//   include: /node_modules/,
//   exclude: /(?:@?babel(?:\/|\\{1,2}|-).+)|regenerator-runtime|core-js|^webpack$|^webpack-assets-manifest$|^webpack-cli$|^webpack-sources$|^@rails\/webpacker$/,
//   use: [ { loader: 'babel-loader', options: [Object] } ]
// } {
//   test: /\.(js|jsx|mjs)?(\.erb)?$/,
//   include: [ '/Users/rick.smit/dev/myapp/app/javascript' ],
//   exclude: /node_modules/,
//   use: [ { loader: 'babel-loader', options: [Object] } ]
// }

test('esm files are being generated', async t => {
  const config = Object.assign({}, defaultConfig, {
    entry: {
      index: './tests/es5-target/fixtures/index.js',
    },
    output: {
      path: `${__dirname}/output`,
      filename: 'index.js',
    },
    module: {
      rules: [
        // rule for compiling node_modules
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
            options: {
              include: ['./tests/es5-target/fixtures/index-b.js'],
            },
          },
        },
        // rule for compiling application code
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
            options: {
              include: ['./tests/es5-target/fixtures/index.js'],
              exclude: './tests/es5-target/fixtures/index-b.js',
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: {
                      browsers: ['IE>=11'],
                    },
                  },
                ],
              ],
            },
          },
        },
      ],
    },
  });
  config.module.rules[0].use.loader = require.resolve('babel-loader');
  const compiler = getCompiler(config);
  await runWebpack(compiler);
  const es5FixtureFileContents = await readFile(
    `${__dirname}/fixtures/output.js`,
    {
      encoding: 'utf-8',
    },
  );
  const es5GeneratedFileContents = await readFile(
    `${__dirname}/output/index.js`,
    {
      encoding: 'utf-8',
    },
  );
  const esmFixtureFileContents = await readFile(
    `${__dirname}/fixtures/output.es6.js`,
    {
      encoding: 'utf-8',
    },
  );
  const esmGeneratedFileContents = await readFile(
    `${__dirname}/output/index.es6.js`,
    {
      encoding: 'utf-8',
    },
  );
  t.is(es5FixtureFileContents, es5GeneratedFileContents);
  t.is(esmFixtureFileContents, esmGeneratedFileContents);
});
