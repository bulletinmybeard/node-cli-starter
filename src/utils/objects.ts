import { isTypeOf } from './misc'

/**
 * Simple check if the given `value` is an Object.
 * @export
 * @param {any} value
 * @return {boolean}
 */
export const isObject = (value: any): boolean => {
    return isTypeOf(value, 'object')
}

/**
 * It takes an object and returns a Map.
 * @export
 * @param {any} values - Object to convert
 * @return A map of the object
 */
export const objectToMap = (values: any): Map<string, any> => {
    let map = new Map()
    for (let key of Object.keys(values)) {
        if (isTypeOf(values[key], 'object')) {
            map.set(key, objectToMap(values[key]))
        } else {
            map.set(key, values[key])
        }
    }
    return map
}

/**
 * It takes a map and returns an object.
 * @export
 * @param {any} values - Map to convert
 * @return An object of the map
 */
export const mapToObject = (values: Map<string, any>): any => {
    let obj = {}
    for (let [key, value] of values.entries()) {
        if (isTypeOf(value, 'map')) {
            obj[key] = mapToObject(value)
        } else {
            obj[key] = value
        }
    }
    return obj
}

export const objectToObject = (values: any): any => {
    let obj = {}
    for (const [key, value] of Object.entries(values)) {
        if (isTypeOf(value, 'object')) {
            obj[key] = objectToObject(value)
        } else {
            obj[key] = value
        }
    }
    return obj
}

export const cloneObject = (values: any): any => {
    return structuredClone(values)
}

export const objectSortByKeys = (values: any): any => {
    return Object.keys(values)
        .sort()
        .reduce((acc, key) => {
            const value = values[key]
            if (isTypeOf(value, 'object')) {
                // @ts-ignore
                acc[key] = objectSortByKeys(value)
            } else {
                acc[key] = value
            }
            return acc
        }, {});

}
