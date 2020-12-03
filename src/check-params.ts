import CONFIG from './config'
import { internals } from './internals'

const TRUE_RESULT:Result = Object.freeze({ pass: true });
const CHECK_FN_CACHE = Object.create(null);
const RULES_CACHE = new Map();
const DEFAULT_CONFIG = ()=>{ return { params: {}, pages: {} } };


/**
 * 
 * @param {String} url      接口地址
 * @param {Object} params   接口参数
 */
export const checkParams = (url:string, params:object):Result => {
    if (CONFIG[url]) {
        try {
            let check = checkFnFactory(url);
            return check(params);
        } catch (e) {
            // uploadLog( location, url, params )
            console.log( e, typeof window !== 'undefined' && window.location, url, params, CONFIG )
            return TRUE_RESULT;
        }
    }
    return TRUE_RESULT;
}

/**
 * 动态注入规则( 当前的配置中不包含 url的配置)
 * @param {*} url  需添加校验的url
 * @param {*} config 参考 ./config.js
 */
export const registerAPI = (url:string, config:URL_CONFIG) => {
    if( !CONFIG[url] ){
        CONFIG[url] = config;
    } else {
        console.warn( `API[${url}] has already setted the configuartion`)
    }
}

/**
 * 动态扩展 url 的配置
 * @param {*} url  需扩展校验规则的url
 * @param {*} config  参考./config.js里的 params
 * @param {*} isPageLevel  是否以页面为维度的配置
 */
export const extendAPI = (url:string, config:API_CONFIG, isPageLevel = false )=>{
    if( !CONFIG[url] ){
        CONFIG[url] = DEFAULT_CONFIG()
    }
    if( isPageLevel ){
        Object.assign (CONFIG[url].pages, config)
    } else {
        Object.assign (CONFIG[url].params, config)
    }
    // config changed, and need reset check function
    CHECK_FN_CACHE[url] = null;
}

// defualt check function
const RETURN_TRUE = () => {
    console.warn('!!!You use the default check fn');
    return true;
}
/**
 * 获取当前页的url pathname
 */
function getPagePathname():string {
    return typeof window === 'undefined' ? '' : window.location.pathname.replace(/(\/[a-z]+)-alias/gi, '$1')
}

/**
 * 根据rule获取校验方法
 * @param {Object} rule
 * {
 *  msg: String,  校验不同的提示语
 *  validator: String|Function
 * }
 */
function getValidator(rule:Rule): ()=>Result {
    if (!RULES_CACHE.has(rule)) {
        const { validator, msg } = rule;
        const fn = typeof validator === 'function' ? validator : internals[validator] || RETURN_TRUE
        RULES_CACHE.set(rule, (...args:any[]) => {
            return {
                pass: fn.apply(null, args as any),
                msg: msg || ""
            }
        })
    }
    return RULES_CACHE.get(rule);
}
/**
 * 获取参数路径
 * @param {String} path  多级的情况，以“.”隔开，例如：'name1' | 'name1.name2'
 */
function getPathNodes(path:string):Array<string> {
    if (typeof path !== 'string' || !path) return [];
    return path.split('.');
}

// generator a check function for the url
/**
 * 生成某个url的校验方法
 * @param {*} url
 */
function checkFnFactory(url = '') {
    return CHECK_FN_CACHE[url] || (CHECK_FN_CACHE[url] = (target:Object) => {
        const { params={}, pages={} } = CONFIG[url] || DEFAULT_CONFIG();
        const page = pages[getPagePathname()] || {};
        const allPaths = { ...params, ...page };

        // get all path's  check functions
        const rules:Array<Function> = [];
        Object.keys(allPaths).forEach(path => {
            let pathValues = traverse(getPathNodes(path), target);
            pathValues = Array.isArray(pathValues) ? pathValues : [pathValues];

            // get single path's check functions
            allPaths[path].map( (rule:Rule) => getValidator(rule)).forEach( (validator: (val:any)=>Result) => {
                pathValues.forEach( (val:any) => {
                    rules.push(() => validator(val))
                })
            })
        });

        // start check ......
        let result = TRUE_RESULT;
        let checkFn = rules[Symbol.iterator]();
        let next = checkFn.next();
        while (typeof next.value === 'function') {
            result = next.value()
            if (result.pass === false) {
                // result.msg && console.log(result.msg)
                break;
            }
            next = checkFn.next();
        }
        return result;
    })
}

// get the values that needs to check
/**
 * 获取需要校验的值
 * @param {*} path 参数路径 ['name']
 * @param {*} obj  参数对象
 * @return 单个值 ｜ 数组
 */
function traverse(path:Array<string> = [], obj:any = {}): any {
    let curKey, curValue = obj;
    for (let i = 0; i < path.length; i++) {
        curKey = path[i];
        curValue = curValue[curKey];
        if (curValue === undefined || curValue === null && (i !== path.length - 1)) {
            break;
        } else if (Array.isArray(curValue)) {
            // 获取数组的每一项去校验
            curValue = curValue.map((item) => {
                return traverse(path.slice(i + 1), item)
            }).flat();
            break;
        }
    }
    return curValue;
};