import { PromptsClass } from '../utils'
import { JSONObject } from '../interfaces'

/**
 * @class BaseClass
 */
export class BaseClass {

    public static instance: BaseClass

    public readonly cmds: string[]
    public readonly args: JSONObject

    public readonly prompts: any

    /**
     * @constructor
     */
    constructor(cmds?: any, args?: any) {
        this.cmds = (cmds || [])
        this.args = (args || {})
        this.prompts = new PromptsClass(this.cmds, this.args)
    }

    public static getInstance(cmds?: any, args?: any): BaseClass {
        if (!BaseClass.instance) {
            BaseClass.instance = new BaseClass(cmds, args)
        }
        return BaseClass.instance
    }
}
