const { declare } = require('@babel/helper-plugin-utils');

// 函数不得被重新赋值

/**

  function foo() {}
  foo = 'a';
  foo();

 */

const noFuncAssignLint = declare((api, options, dirname) => {
  api.assertVersion(7);

  return {
    pre(file) {
      file.set('errors', []);
    },
    visitor: {
      AssignmentExpression(path, state) {
        const errors = state.file.get('errors');

        const assignTarget = path.get('left').toString();
        const binding = path.scope.getBinding(assignTarget);
        if (binding) {
          // 查找到了左值对应的声明，是函数声明
          if (
            binding.path.isFunctionDeclaration() ||
            binding.path.isFunctionExpression()
          ) {
            const tmp = Error.stackTraceLimit;
            Error.stackTraceLimit = 0;
            errors.push(
              path.buildCodeFrameError('You can not reassign a function', Error)
            );
            Error.stackTraceLimit = tmp;
          }
        }
      },
    },
    post(file) {
      console.log(file.get('errors'));
    },
  };
});

module.exports = noFuncAssignLint;
