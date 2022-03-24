const { declare } = require('@babel/helper-plugin-utils');

// 封装一个方法，传入类型对象，返回 number、string、boolean 等类型字符串
function resolveType(targetType) {
  const tsTypeAnnotationMap = {
    TSStringKeyword: 'string',
  };
  switch (targetType.type) {
    case 'TSTypeAnnotation':
      return tsTypeAnnotationMap[targetType.typeAnnotation.type];
    case 'NumberTypeAnnotation':
      return 'number';
    case 'BooleanTypeAnnotation':
      return 'boolean';
  }
}

function noStackTraceWrapper(cb) {
  const tmp = Error.stackTraceLimit;
  Error.stackTraceLimit = 0;
  cb && cb(Error);
  Error.stackTraceLimit = tmp;
}

const assignmentChecker = declare((api, options, dirname) => {
  api.assertVersion(7);

  return {
    pre(file) {
      file.set('errors', []);
    },
    visitor: {
      VariableDeclarator(path, state) {
        const errors = state.file.get('errors');

        const idType = resolveType(path.get('id').getTypeAnnotation());
        const initType = resolveType(path.get('init').getTypeAnnotation());

        if (idType !== initType) {
          noStackTraceWrapper((Error) => {
            errors.push(
              path
                .get('init')
                .buildCodeFrameError(
                  `${initType} can not be assigned to ${idType}`,
                  Error
                )
            );
          });
        }
      },
    },
    post(file) {
      console.log(file.get('errors'));
    },
  };
});

module.exports = assignmentChecker;
