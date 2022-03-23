import { parse } from '@babel/parser';
import traverse from '@babel/traverse'
import generate from '@babel/generator'
import { arrayExpression, Expression, isMemberExpression, stringLiteral } from '@babel/types';
import { expression } from '@babel/template';

type NewExpression = Expression & { isNew: boolean }

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
    // 用新的节点替换了旧的节点之后，babel traverse 会继续遍历新节点
    // 所以这里标记一下让它不要再遍历该新节点
    if ((path.node as NewExpression).isNew) {
      return;
    }

    const calleeName = generate(path.node.callee).code;
    if (targetCalleeName.includes(calleeName)) {
      const { line, column } = path.node.loc.start;
      const newNode = { ...expression(`console.log("filename: (${line}, ${column})")`)(), isNew: true };

      if (path.findParent(path => path.isJSXElement())) {
        // JSX 中的 console 代码不能简单的在前面插入一个节点
        // 而要把整体替换成一个数组表达式，因为 JSX 中只支持单个表达式
        // 所以这里把原来的节点换成了一个数组
        path.replaceWith(arrayExpression([newNode, path.node]));
        // 跳过子节点处理
        path.skip();
      } else {
        path.insertBefore(newNode);
      }
    }
  },
});

const { code, map } = generate(ast);
console.log(code);
