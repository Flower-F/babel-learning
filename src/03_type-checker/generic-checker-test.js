const { transformFromAstSync } = require('@babel/core');
const parser = require('@babel/parser');
const genericCheckerPlugin = require('./plugins/generic-checker');

const sourceCode = `
  function add<T>(a: T, b: T) {
    return a + b;
  }
  add<number>(1, '2');
`;

const ast = parser.parse(sourceCode, {
  sourceType: 'unambiguous',
  plugins: ['typescript'],
});

const { code } = transformFromAstSync(ast, sourceCode, {
  plugins: [
    [
      genericCheckerPlugin,
      {
        fix: true,
      },
    ],
  ],
  comments: true,
});
