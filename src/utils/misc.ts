import { isArray, isString, isObject, convertString } from './'

/**
 * Determines the value type.
 *
 * @examples
 * typeOf(myObject) > object
 * typeOf(myObject, false) > Object
 *
 * typeOf(document.getElementById('my-div-element')) > htmldivelement
 * typeOf(document.getElementById('my-div-element'), false) > HTMLDivElement
 *
 * @param {any} value
 * @param {boolean?} toLowerCase - If `true`, `typeOf` will return the type lowercased (default: true)
 */
export const typeOf = (value: any, toLowerCase: boolean = true): string => {
    let type: string = (typeof value)
    try {
        switch (true) {
            case (value instanceof String):
                type = 'String'
                break
            case (value instanceof Date):
                type = 'Date'
                break
            case (isUndefined(value) || value === null):
                type = `${value}`
                break
            default:
                type = Object
                    .prototype
                    .toString
                    .call(value)
                    .replace(/\[object\s+([\w]+)\]/gi, '$1')
                break
        }
    } catch (err) {
        console.log('[typeOf] error: ', err)
    }
    return (toLowerCase)
        ? `${type}`.toLowerCase()
        : type
}

/**
 * Quick type check.
 *
 * @example
 * isTypeOf(myArray, 'array') > true
 * isTypeOf('hello-space', 'array') > false
 *
 * @param {any} source
 * @param {string} expectedType -Expected type to check against
 */
export const isTypeOf = (source: any, expectedType: string): boolean => {
    return typeOf(source) === `${expectedType}`
}

/**
 * Returns the length of a string, number of Object properties or array items.
 *
 * @param {any} value
 * @return {number}
 */
export const getLength = (value: any): number => {
    if (isString(value)) {
        return value.length
    } else if (isObject(value)) {
        return Object.keys(value).length
    } else if (isArray(value)) {
        return value.length
    } else {
        return `${value}`.length
    }
}

/**
 * Checks whether the given value is empty.
 * @param {any} value
 * @return {boolean}
 */
export const isEmpty = (value: any): boolean => {
    return (getLength(value) === 0)
}

/**
 * Checks whether the given value is undefined.
 * @param {any} value
 * @return {boolean}
 */
export const isUndefined = (value: any): boolean => {
    return (typeof value === 'undefined')
}

/**
 * Checks whether the given value is a boolean.
 * @param {any} value
 * @return {boolean}
 */
export const isBoolean = (value: unknown): boolean => {
    return isTypeOf(value, 'boolean')
}

/**
 * Checks if all items from `sourceValues` are to find in `targetArray`.
 *
 * @example
 * const searchParams = ['code', 'session_state', 'state']
 * hasEvery(searchParams, ['code', 'session_state', 'state']) > true
 *
 * @param {any} sourceValues - The source values to check against.
 * @param {string[]} targetArray - The array of values to check against.
 * @return {boolean}
 */
export const hasEvery = (sourceValues: any, targetArray: string[]): boolean => {
    return targetArray.every((param) => {
        if (isTypeOf(sourceValues, 'map')
            || isTypeOf(sourceValues, 'set')) {
            return sourceValues.has(param)
        } else if (isTypeOf(sourceValues, 'array')) {
            return sourceValues.includes(param)
        }
    })
}

export const typecast = (source: any, targetType?: any): string => {
    /**
     * Extract the type from the source.
     */
    let sourceType: string = Object
        .prototype
        .toString
        .call(source)
        .replace(new RegExp('\\[object\\s+([\\w]+)\\]', 'gi'), '$1')
        .toLowerCase()

    /**
     * Do something with the source value
     * and correct the source type if needed.
     */
    switch (sourceType) {
        case 'string':
            if (new RegExp('^([\\d]+)$', 'i').test(source)) {
                sourceType = 'number'
                source = parseInt(`${source}`, 10);
            } else if (new RegExp('^(true|false|yes|no|on|off)$', 'i').test(source)) {
                sourceType = 'boolean'
                source = ['true', 'yes', 'on'].includes(source)
            } else {
                source = `${source}`.trim()
            }
            break
        case 'boolean':
        case 'number':
        case 'array':
        case 'object':
        case 'null':
        case 'undefined':
            break
        default:
    }

    /**
     * Cast the source to the given `target` type.
     */
    if (typeof targetType !== 'undefined') {
        const sourceHasWildcard = (source.indexOf('*') > -1)

        switch (`${sourceType}-${targetType}`) {
            case 'object-string':
            case 'array-string':
                try {
                    source = JSON.stringify(source);
                } catch (err) { /* ignore */ }
                break
            case 'string-boolean':
            case 'string-number':
            case '*-null':
            case '*-undefined':
                break
            default:
                console.log(`Target type '${targetType}' not supported for source type '${sourceType}'`)
        }
    }

    return source
}
