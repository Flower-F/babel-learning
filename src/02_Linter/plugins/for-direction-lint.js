const { declare } = require('@babel/helper-plugin-utils');

// 检查 for 循环的以下错误

/**

  for (var i = 0; i < 10; i--) {
  }
  for (var i = 10; i >= 0; i++) {
  }

*/

const forDirectionLint = declare((api, options, dirname) => {
  api.assertVersion(7);

  return {
    pre(file) {
      // file 是用于存储的
      file.set('errors', []);
    },
    visitor: {
      ForStatement(path, state) {
        const errors = state.file.get('errors');
        const testOperator = path.node.test.operator;
        const updateOperator = path.node.update.operator;

        let shouldUpdateOperator;
        if (['<', '<='].includes(testOperator)) {
          shouldUpdateOperator = '++';
        } else if (['>', '>='].includes(testOperator)) {
          shouldUpdateOperator = '--';
        }

        if (shouldUpdateOperator !== updateOperator) {
          const tmp = Error.stackTraceLimit;
          // 因为错误堆栈太丑了，所以我们这里把它去掉
          Error.stackTraceLimit = 0;
          errors.push(
            path.get('update').buildCodeFrameError('The for direction error occurs', Error)
          );
          Error.stackTraceLimit = tmp;
        }
      },
    },
    post(file) {
      console.log(file.get('errors'));
    },
  };
});

module.exports = forDirectionLint;
