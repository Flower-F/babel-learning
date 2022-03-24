import { transformFileSync } from '@babel/core';
import insertParametersPlugin from './parameters-insert-plugin';
import path from 'path';

const { code } = transformFileSync(path.join(__dirname, './sourceCode.js'), {
  plugins: [insertParametersPlugin],
  parserOpts: {
    sourceType: 'unambiguous',
    plugins: ['jsx']
  }
})!;

console.log(code);
