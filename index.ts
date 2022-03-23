import { parse } from '@babel/parser';
import traverse from '@babel/traverse'
import generate from '@babel/generator'

const sourceCode = `console.log(1);`;

const ast = parse(sourceCode, {
  sourceType: 'unambiguous',
});

traverse(ast, {
  CallExpression(path, state) { },
});

const { code, map } = generate(ast);
console.log(code);
