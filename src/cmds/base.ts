import { PromptsClass } from '../utils/prompts'
import { LoggerClass } from '../utils/logger'

import { JSONObject } from '../interfaces'

/**
 * @class BaseClass
 */
export class BaseClass {

    public static instance: BaseClass

    public readonly cmds: string[]
    public readonly args: JSONObject

    public readonly logger: any
    public readonly prompts: any

    /**
     * @constructor
     */
    constructor(cmds?: any, args?: any) {
        this.cmds = (cmds || [])
        this.args = (args || {})
        this.prompts = new PromptsClass(this.cmds, this.args)
        this.logger = new LoggerClass()
    }

    public static getInstance(cmds?: any, args?: any): BaseClass {
        if (!BaseClass.instance) {
            BaseClass.instance = new BaseClass(cmds, args)
        }
        return BaseClass.instance
    }
}
