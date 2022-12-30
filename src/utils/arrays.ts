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
