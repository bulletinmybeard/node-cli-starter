import { isTypeOf } from './misc'

/**
 * Checks if the given `value` is of type Map.
 * @export
 * @param {any} value - Input value
 * @return {boolean}
 */
export const isMap = (value: any): boolean => {
    return isTypeOf(value, 'map')
}
