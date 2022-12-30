import { isObject, isTypeOf, typeOf, objectSortByKeys } from './index'
import {JSONObject} from "../interfaces";

/**
 * @export
 * @param {any} defaulOptions
 * @param {any} options
 * @param {boolean} strictMode
 * @return {any}
 */
const mergeOptions = (
    defaulOptions: JSONObject,
    options: JSONObject = {},
    strictMode: boolean = false,
): JSONObject => {
    if (!isObject(defaulOptions)
        || !isObject(options)) {
        throw new Error(`[MergeOptions] 'defaulOptions' (${typeOf(defaulOptions)}) and 'sdkOptions' (${typeOf(options)}) need to be objects.`)
    }
    return Object
        .entries(options)
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

/**
 * It merges two objects, and if the second object has a property that the first object doesn't, it throws an error.
 *
 * @export
 * @param {any} defaulOptions - The default options that are set by the SDK.
 * @param {any} options - The options passed to the SDK
 * @return {object} The return value is the merged options.
 */
export const mergeOptionsStrict = (
    defaulOptions: JSONObject,
    options: JSONObject
): JSONObject => {
    return mergeOptions(defaulOptions, options, true)
}

/**
 * Given an object, return an array of its keys.
 *
 * @export
 * @param {JSONObject} object
 * @return {any[]} An array of the keys of the object passed in.
 */
export const keys = (object: JSONObject): any[] => {
    return Object.keys(object)
}
