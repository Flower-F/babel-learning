import { parse } from '@babel/parser';
import traverse from '@babel/traverse'
import generate from '@babel/generator'
import { isMemberExpression, stringLiteral } from '@babel/types';

const sourceCode = `
  console.log(1);

  function func() {
    console.info(2);
  }

  export default class Clazz {
    say() {
      console.debug(3);
    }
    render() {
      return <div>{ console.error(4) }</div>
    }
  }
`;

const ast = parse(sourceCode, {
  sourceType: 'unambiguous',
  plugins: ['jsx']
});

const targetCalleeName = ['log', 'info', 'error', 'debug'].map(item => `console.${item}`);

traverse(ast, {
  CallExpression(path, state) {
    const calleeName = generate(path.node.callee).code;
    if (targetCalleeName.includes(calleeName)) {
      const { line, column } = path.node.loc.start;
      path.node.arguments.unshift(stringLiteral(`filename: (${line}, ${column})`))
    }
  },
});

const { code, map } = generate(ast);
console.log(code);
