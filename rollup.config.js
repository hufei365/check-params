const path = require('path');
import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
const uglify = require('rollup-plugin-uglify').uglify;
const merge = require('lodash.merge');
const pkg = require('./package.json');

const extensions = ['.ts', '.js'];

const resolve = function (...args) {
    return path.resolve(__dirname, ...args);
};

// 打包任务的个性化配置
const jobs = {
    esm: {
        output: {
            format: 'esm',
            file: resolve(pkg.module),
        },
    },
    umd: {
        output: {
            format: 'umd',
            file: resolve(pkg.main),
            name: 'rem',
        },
    },
    cjs: {
        output: {
            format: 'cjs',
            file: resolve(pkg.main.replace(/(.\w+)$/, '.cjs$1')),
        }
    },
    min: {
        output: {
            format: 'umd',
            file: resolve(pkg.main.replace(/(.\w+)$/, '.min$1')),
            name: 'rem',
        },
        plugins: [uglify()],
    },
};

// 从环境变量获取打包特征
const mergeConfig = jobs[process.env.FORMAT || 'esm'];

module.exports = merge(
    {
        input: resolve('./src/index.ts'),
        output: {},
        plugins: [
            typescript(),
            nodeResolve({
                extensions,
                modulesOnly: true,
            }),
            commonjs({
                include: "node_modules/**"
            }),
            babel({
                exclude: 'node_modules/**',
                extensions,
                babelHelpers: 'runtime'
            }),
        ],
    },
    mergeConfig,
);