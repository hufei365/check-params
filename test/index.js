const { checkParams, registerAPI } = require('../dist/checkparams.cjs')
const chalk = require('chalk')


const config = {
    // 基本用法
    '/testSingleValue': {
        params: {
            'test': [{
                msg: 'test can not be empty',
                validator: 'required'
            }]
        }
    },
    // 参数嵌套模式 ({ a: {b:3}}，需校验b的case）
    '/testDeepPath': {
        params: {
            'level1.level2': [{
                msg: 'level1.level2 can not be empty',
                validator: 'required'
            }]
        }
    },
    // 数组形式的校验 （ [{a:1},{a:2}]: 需校验每一项的a）
    '/testArray': {
        params: {
            'list.test': [{
                msg: 'list.test can not be empty',
                validator: 'required'
            }]
        }
    },
    // 嵌套+数组两种形式的结合
    '/testDeepArray': {
        params: {
            'level1.level2.test': [{
                msg: 'level1.level2.test can not be empty',
                validator: 'required'
            }]
        }
    },
    // 多个校验规则
    '/testmutilrules': {
        params: {
            'test': [{
                msg: 'testmutilrules can not be empty',
                validator: 'required'
            }, {
                msg: 'testmutilrules can not be isNaN',
                validator: 'number'
            }]
        }
    },
    // page，校验规则不同
    '/testspecialpath': {
        params: {
            test: [{
                msg: 'pathname: / can not be empty',
                validator: 'required'
            }, {
                msg: 'pathname: / can not be a NaN',
                validator: 'number'
            }]
        },
        pages: {
            '/test/special/page': {
                test: [{
                    msg: 'pathname: / can not be a NaN',
                    validator: 'string'
                }]
            }
        }
    },
    // 这是测试用例，异常情况，非正常使用方式
    '/emptypath': {
        params: {
            '': [{
                msg: "test empty path",
                validator: 'required'
            }]
        }
    },
    // 自定义校验方法
    '/customvalidator': {
        params: {
            test: [{
                msg: 'test value can not be empty',
                validator: 'required'
            }, {
                msg: "test value should > 4",
                validator: val => val > 4
            }, {
                msg: 'test value should < 10',
                validator: val => val < 10
            }]
        }
    },
    // 嵌套场景下，无法取到父级值的case（ 还未完整实现）
    '/cannotgetparent': {
        params: {
            'parent.son': [{
                msg: 'can be undefined',
                validator: val => val === undefined
            }]
        }
    }
}

    ; Object.keys(config).forEach(k => {
        registerAPI(k, config[k])
    });

const testData = [{
    name: 'path not matched[pass]',
    url: '/emptypath',
    params: {
        test: null
    },
    result: true
}, {
    name: 'base test[not pass]',
    url: '/testSingleValue',
    params: {
        test: null
    },
    result: false
}, {
    name: 'base test 02[not pass]',
    url: '/testSingleValue',
    params: {
        test: ''
    },
    result: false
}, {
    name: 'test deep path[not pass]',
    url: '/testDeepPath',
    params: {
        level1: {
            level2: null
        }
    },
    result: false
}, {
    name: 'test deep path[pass]',
    url: '/testDeepPath',
    params: {
        level1: {
            level2: 1
        }
    },
    result: true
}, {
    name: 'test array[not pass]',
    url: '/testArray',
    params: {
        list: [
            {
                test: null
            }
        ]
    },
    result: false
}, {
    name: 'test array[pass]',
    url: '/testArray',
    params: {
        list: [
            {
                test: 'false'
            }
        ]
    },
    result: true
}, {
    name: 'test deep array [not pass]',
    url: '/testDeepArray',
    params: {
        level1: [{
            level2: [
                {
                    test: null
                }
            ]
        }]
    },
    result: false
}, {
    name: 'test deep array [pass]',
    url: '/testDeepArray',
    params: {
        level1: [{
            level2: [
                {
                    test: 1
                }
            ]
        }]
    },
    result: true
}, {
    name: 'test deep array, mutils children [not pass]',
    url: '/testDeepArray',
    params: {
        level1: [{
            level2: [
                {
                    test: 1
                }, {
                    test: null
                }
            ]
        }]
    },
    result: false
}, {
    name: 'test mutil rules [not pass]',
    url: '/testmutilrules',
    params: {
        test: 'a56'
    },
    result: false
}, {
    name: 'test mutil rules [pass]',
    url: '/testmutilrules',
    params: {
        test: 56
    },
    result: true
}, {
    name: 'test special page path not matched [not pass]',
    url: '/testspecialpath',
    params: {
        test: null
    },
    result: false,
}, {
    name: 'test special page path not matched [pass]',
    url: '/testspecialpath',
    params: {
        test: 123
    },
    result: true,
}, {
    name: 'test special page path matched  [not pass]',
    url: '/testspecialpath',
    params: {
        test: 123
    },
    result: false,
    setEnv() {
        globalThis.window = {
            location: {
                pathname: '/test/special/page'
            }
        }
    }
}, {
    name: 'test special page path matched  [pass]',
    url: '/testspecialpath',
    params: {
        test: '123'
    },
    result: true,
    setEnv() {
        globalThis.window = {
            location: {
                pathname: '/test/special/page'
            }
        }
    }
}, {
    name: 'test custom validator [not pass]',
    url: '/customvalidator',
    params: {
        test: null
    },
    result: false,
}, {
    name: 'test custom validator can not < 4 [not pass]',
    url: '/customvalidator',
    params: {
        test: 3
    },
    result: false
}, {
    name: 'test custom validator can not > 10  [not pass]',
    url: '/customvalidator',
    params: {
        test: 11
    },
    result: false
}, {
    name: 'test custom validator no params [pass]',
    url: '/customvalidator',
    params: {
        test: 9,
        nottest: 11
    },
    result: true
}, {
    name: 'test parent value is undefined [not pass]',
    url: '/cannotgetparent',
    params: {
        parent: null
    },
    result: false
}];


testData.slice(0).forEach(({ name = "", url, params, result, setEnv = ()=>{} }, index) => {
    setEnv();
    const checkResult = checkParams(url, params)
    if (result !== checkResult.pass) {
        faillog(` ${String(index)} ${name||url}`)
    } else {
        success(` ${String(index)} ${name||url} `)
    }
})

function success(str) {
    console.log(chalk.green(`${str}......success`))
}
function faillog(str) {
    console.warn(chalk.red(`${str} ......failed`))
}