import { isTypeOf, isUndefined } from './misc'

/**
 * Simple check if the given `value` is an Array.
 * @export
 * @param {any} value - Input value
 * @return {boolean}
 */
export const isArray = (value: any): boolean => {
    return isTypeOf(value, 'array')
}

/**
 * Sorts an Array (default: decremental).
 * @export
 * @param {any[]} array
 * @param {boolean} reverse
 * @return {any[]}
 */
export const sortArray = (array: any[], reverse = false): any[] => {
    return array.sort((x, y) => {
        if (!isUndefined(reverse)) {
            if (x > y) { return -1 }
        } else {
            if (x < y) { return -1 }
        }
        if (x < y) { return 1 }
        return 0
    })
}

/**
 * Removes duplicated Array items
 *
 * @example
 * arrayUnique(['john', 'doe'], ['jane', 'doe']) > ['john', 'jane', 'doe']
 *
 * @export
 * @param {any[]} values
 * @return {any[]}
 */
export const arrayUnique = (values: any[]): any[] => {
    return [...new Set(values)]
}

/**
 * Helper to join path array items.
 * @export
 * @param {any[]} items
 * @return {string}
 */
export const joinPath = (...items: any[]): string => {
    return items.join('/')
}
