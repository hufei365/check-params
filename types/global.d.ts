declare interface Result {
    pass: boolean,
    msg?: string
}

declare type Validator = (val: any) => boolean
declare interface Rule {
    msg: string,
    validator: string | Validator
}
declare interface ParamsConfig {
    [propName: string]: Array<Rule>
}
declare interface URL_CONFIG {
    params: ParamsConfig,
    pages?: {
        [propName: string]: ParamsConfig
    }
}
declare interface API_CONFIG {
    [propName: string]: URL_CONFIG
}

declare const window:Window;
