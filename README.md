# check params

> 以配置的形式， 对参数进行校验。

``` js
const config = {
    // 基本用法
    '/testSingleValue': {
        params: {
            'test': [{
                msg: 'test can not be empty',
                validator: 'required'
            }]
        }
    }
};

const { checkParams } = require('../dist/checkparams.cjs')

const result1 = checkParams('/testSingleValue', { test: 1 }) // return { pass: true }
const result2 = checkParams('/testSingleValue', { test:  null}) // return { pass: false, msg:  'test can not be empty'}
```