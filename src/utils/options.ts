import { isObject, isTypeOf, typeOf, objectSortByKeys } from './index'

/**
 * Merge SDK options against module default options.
 *
 * @description Only identical property keys and value types will be updated.
 *
 * @examples
 * this._options = mergeOptions({
 *   enabled: true,
 *   intervalDelay: '1m', // 1 minute
 * }, { enabled: false }) > { enabled: false, intervalDelay: '1m' }
 *
 * this._options = mergeOptions({
 *   enabled: true,
 *   intervalDelay: '1m', // 1 minute
 * }, { enabled: false }) > { enabled: false, intervalDelay: '1m' }
 *
 * @export
 * @param {any} defaulOptions
 * @param {any} sdkOptions
 * @param {string} accessor
 * @param {boolean} strictMode
 * @return {any}
 */
const _mergeOptions = (
    defaulOptions: any,
    sdkOptions: any = {},
    accessor: string | undefined,
    strictMode: boolean = false,
): any => {
    if (!isObject(defaulOptions)
        || !isObject(sdkOptions)) {
        throw new Error(`[MergeOptions] 'defaulOptions' (${typeOf(defaulOptions)}) and 'sdkOptions' (${typeOf(sdkOptions)}) need to be objects.`)
    }
    if (typeof accessor === 'string'
        && sdkOptions?.[accessor]) {
        sdkOptions = sdkOptions[accessor]
    }
    return Object
        .entries(sdkOptions)
        .reduce((acc, [key, value]) => {
            if ((key in acc)) {
                if (strictMode) {
                    if (!isTypeOf(value, typeOf(acc?.[key]))) {
                        console.warn(`[MergeOptions] TypeCheck failed: 'defaulOptions' (${typeOf(value)}) and 'sdkOptions' (${typeOf(acc?.[key])}) need to be of type ${typeOf(value)}.`)
                        return
                    }
                }
                if ((key in acc)) {
                    if (isTypeOf(value, 'object')) {
                        // @ts-ignore
                        acc[key] = {...acc[key], ...value}
                    } else if (isTypeOf(value, 'array')) {
                        // @ts-ignore
                        acc[key] = [...acc[key], ...value]
                    } else {
                        acc[key] = value
                    }
                } else {
                    acc[key] = value
                }
            }
            return acc
        }, defaulOptions)
}

export const _validateOptions = (
    defaulOptions: any,
    sdkOptions: any = {},
): any => {
    if (!isObject(defaulOptions)
        || !isObject(sdkOptions)) {
        throw new Error(`[MergeOptions] 'defaulOptions' (${typeOf(defaulOptions)}) and 'sdkOptions' (${typeOf(sdkOptions)}) need to be objects.`)
    }
    defaulOptions = objectSortByKeys(defaulOptions)
    sdkOptions = objectSortByKeys(sdkOptions)
    return Object
        .entries(sdkOptions)
        .reduce((acc, [key, value]) => {
            if ((key in defaulOptions)) {
                if (!isTypeOf(value, typeOf(defaulOptions?.[key]))) {
                    acc['error'][key] = value
                } else {
                    acc['valid'][key] = value
                }
            } else {
                acc['error'][key] = value
            }
            return acc
        }, {
            valid: {},
            error: {},
        })
}

/**
 * It merges two objects, and if the second object has a property that the first object doesn't, it throws an error.
 *
 * @export
 * @param {any} defaulOptions - The default options that are set by the SDK.
 * @param {any} sdkOptions - The options passed to the SDK
 * @param {string} [accessor] - The accessor is the name of the property that you want to merge.
 * @return {object} The return value is the merged options.
 */
export const mergeOptionsStrict = (
    defaulOptions: any,
    sdkOptions: any,
    accessor?: string,
): any => {
    return _mergeOptions(defaulOptions, sdkOptions, accessor, true)
}

/**
 * It takes two objects, and merges the second object into the first object, and returns it.
 *
 * @export
 * @param {any} defaulOptions - The default options object.
 * @param {any} customOptions - The options that the user has passed in.
 * @param {string} [accessor] - The accessor is the name of the property that you want to merge.
 * @return {object} The return value is the merged options.
 */
export const mergeOptions = (
    defaulOptions: any,
    customOptions: any,
    accessor?: string,
): any => {
    return _mergeOptions(defaulOptions, customOptions, accessor)
}

/**
 * Given an object, return an array of its keys.
 *
 * @export
 * @param {Record<string, any>} object
 * @return {any[]} An array of the keys of the object passed in.
 */
export const keys = (object: Record<string, any>): any[] => {
    return Object.keys(object)
}
