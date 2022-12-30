import { ux } from '@cto.ai/sdk'

import { JSONObject } from '../interfaces'

interface PromptTypeOptions {
    message: string;
    choices?: any[];
    defaultValue?: any;
    validate?: (value: any) => boolean | string;
    afterMessage?: string;
    flag?: string;
}

interface PromptOptions extends PromptTypeOptions {
    type: string;
}

/**
 * @class PromptsClass
 */
export class PromptsClass {

    private cmds: string[]
    private args: JSONObject

    /**
     * @constructor
     */
    constructor(cmds?: string[], args?: JSONObject) {
        this.cmds = (cmds || [])
        this.args = (args || {})
    }

    async input(prompt: PromptTypeOptions): Promise<string> {
        return await this.prompt({
            ...{ type: 'input' },
            ...prompt,
        })
    }

    async confirm(prompt: PromptTypeOptions): Promise<boolean> {
        return await this.prompt({
            ...{ type: 'confirm' },
            ...prompt,
        })
    }

    async list(prompt: PromptTypeOptions): Promise<string> {
        return await this.prompt({
            ...{ type: 'list' },
            ...prompt,
        })
    }

    async prompt({ type, message, choices, defaultValue, validate, afterMessage, flag }: PromptOptions): Promise<any> {
        const { input }: any = await ux.prompt({
            type,
            name: 'input',
            message,
            choices,
            default: defaultValue,
            validate,
            afterMessage,
            flag: (flag ? flag : 'V'),
        })
        return input
    }

    public inputValidation(promptName: string, value: any): boolean {
        let regex
        switch (promptName) {
            case 'profileName':
                regex = /^([-0-9a-z]+)$/gmi
                if (!regex.test(value)) {
                    console.log(`\n\r Profile name '${value}' is invalid! (${regex})`)
                    return false
                }
                break
            case 'arn':
                regex = /^arn:[a-z0-9-]+:([a-z0-9-]+)?:[a-z0-9-]+:([0-9]{12}):([a-zA-Z0-9-_\/]+)?$/gmi
                if (!regex.test(value)) {
                    console.log(`\n\r ARN '${value}' is invalid! (${regex})`)
                    return false
                }
                break
        }
        return true
    }
}
