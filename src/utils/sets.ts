import { isTypeOf } from './misc'

export const isSet = (value: any): boolean => {
    return isTypeOf(value, 'set')
}

/**
 * It takes a Set and returns an array of the values in the Set.
 * @export
 * @param values - Set<any> - The set to convert to an array
 * @return {any[]}
 */
export const setToArray = (values: Set<any>): any[] => {
    return Array.from(values.keys())
}
