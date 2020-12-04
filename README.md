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

## config 配置

``` js
{
    // key为 api 地址
    '/testSingleValue': {
        // params 存放待校验待参数
        params: {
            // key（test）为待校验参数名， 支持 parent.child 这种多级嵌套方式，数组类型亦是如此
            // value 是数组形式，里面存放校验规则
            'test': [{
                msg: 'test can not be empty',  // 校验失败的提示信息
                validator: 'required'   // 校验规则 1: string  表示该组件内置校验方法的name（internal.ts)；  2:  function： 自定义的校验方法
            }]
        },
        // pages用于存放特定页面的校验规则，在上述params中不满足的情况下
        pages: {
            // key (/page/index) 为页面的pathname 
            // value 结构同 params相同
            '/page/index': {
                test: [{
                    msg: 'page【/page/index】： "test" should be a String',
                    validator: 'string'
                }]
            }
        }
    }
}
```