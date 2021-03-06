const { declare } = require('@babel/helper-plugin-utils');

function resolveType(targetType, referenceTypesMap = {}) {
  const tsTypeAnnotationMap = {
    TSStringKeyword: 'string',
    TSNumberKeyword: 'number',
  };
  switch (targetType.type) {
    case 'TSTypeAnnotation':
      // 如果参数是泛型，根据传入的参数取值
      if (targetType.typeAnnotation.type === 'TSTypeReference') {
        return referenceTypesMap[targetType.typeAnnotation.typeName.name];
      }
      return tsTypeAnnotationMap[targetType.typeAnnotation.type];
    case 'NumberTypeAnnotation':
      return 'number';
    case 'StringTypeAnnotation':
      return 'string';
    case 'TSNumberKeyword':
      return 'number';
  }
}

function noStackTraceWrapper(cb) {
  const tmp = Error.stackTraceLimit;
  Error.stackTraceLimit = 0;
  cb && cb(Error);
  Error.stackTraceLimit = tmp;
}

const genericChecker = declare((api, options, dirname) => {
  api.assertVersion(7);

  return {
    pre(file) {
      file.set('errors', []);
    },
    visitor: {
      CallExpression(path, state) {
        const errors = state.file.get('errors');
        // 参数的真实类型
        const realTypes = path.node.typeParameters.params.map((item) => {
          return resolveType(item);
        });
        // 实参的类型
        const argumentsTypes = path.get('arguments').map((item) => {
          return resolveType(item.getTypeAnnotation());
        });
        const calleeName = path.get('callee').toString();
        // 根据函数名来查找函数声明
        const functionDeclarePath = path.scope.getBinding(calleeName).path;
        const realTypeMap = {};
        // 把类型参数的值赋给函数声明语句的泛型参数
        functionDeclarePath.node.typeParameters.params.forEach((item, index) => {
          realTypeMap[item.name] = realTypes[index];
        });
        const declareParamsTypes = functionDeclarePath
          .get('params')
          .map((item) => {
            return resolveType(item.getTypeAnnotation(), realTypeMap);
          });

        argumentsTypes.forEach((item, index) => {
          if (item !== declareParamsTypes[index]) {
            noStackTraceWrapper((Error) => {
              errors.push(
                path
                  .get('arguments.' + index)
                  .buildCodeFrameError(
                    `${item} can not assign to ${declareParamsTypes[index]}`,
                    Error
                  )
              );
            });
          }
        });
      },
    },
    post(file) {
      console.log(file.get('errors'));
    },
  };
});

module.exports = genericChecker;
