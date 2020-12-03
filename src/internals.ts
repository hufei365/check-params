export const internals:{ [propName: string]: ((val:any)=>boolean) } = {
    'number': ( val:any )=>{
        if( typeof val === 'undefined' ) return false;
        if( isNaN(val) ) return false;
        return true;
    },
    'required': (val:any)=>!!val,
    'string': (val:any)=>typeof val === 'string'
}