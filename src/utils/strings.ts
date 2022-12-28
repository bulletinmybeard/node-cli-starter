import { typeOf, isTypeOf } from './misc'

/**
 * Checks whether the given `value` is a string.
 * @export
 * @param {any} value
 * @return {boolean}
 */
export const isString = (value: any): boolean => {
    return isTypeOf(value, 'string')
}

export const convertString = (value: string): string => {
    return `${value}`
        .replace(new RegExp('([-_][a-z])', 'ig'), (text) => {
            return text.toUpperCase()
                .replace('-', '')
                .replace('_', '')
        })
}
