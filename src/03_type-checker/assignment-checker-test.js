const { transformFromAstSync } = require('@babel/core');
const parser = require('@babel/parser');
const assignmentCheckerPlugin = require('./plugins/assignment-checker.js');

// 插件检测类型错误
const sourceCode = `
  let name: string = true;
`;

const ast = parser.parse(sourceCode, {
  sourceType: 'unambiguous',
  plugins: ['typescript'],
});

const { code } = transformFromAstSync(ast, sourceCode, {
  plugins: [
    [
      assignmentCheckerPlugin,
      {
        fix: true,
      },
    ],
  ],
  comments: true,
});
