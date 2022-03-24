import generate from "@babel/generator";
import { NodePath } from "@babel/traverse";
import babelTypes, { CallExpression } from "@babel/types";
import templateTypes from '@babel/template';

type NewExpression = CallExpression & { isNew: boolean };

const targetCalleeName = ['log', 'info', 'error', 'debug'].map(item => `console.${item}`);

export default function insertParametersPlugin({ types, template }: { types: typeof babelTypes, template: typeof templateTypes }) {
  return {
    visitor: {
      CallExpression(path: NodePath<NewExpression>, state: { filename: string | undefined }) {
        if (path.node.isNew) {
          return;
        }

        const calleeName = generate(path.node.callee).code;
        if (targetCalleeName.includes(calleeName)) {
          const { line, column } = path.node.loc!.start;
          const newNode = { ...template.expression(`console.log("${state.filename || 'unknown filename'}: (${line}, ${column})")`)(), isNew: true };
          newNode.isNew = true;

          if (path.findParent(path => path.isJSXElement())) {
            path.replaceWith(types.arrayExpression([newNode, path.node]))
            path.skip();
          } else {
            path.insertBefore(newNode);
          }
        }
      }
    }
  }
}
