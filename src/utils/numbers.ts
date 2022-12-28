import { isTypeOf } from './misc'

/**
 * Checks whether the given `value` is a number.
 * @export
 * @param {any} value
 * @return {boolean}
 */
export const isNumber = (value: any): boolean => {
    return isTypeOf(value, 'number')
}

