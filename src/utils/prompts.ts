import * as prompts from 'prompts'
import { ux } from '@cto.ai/sdk'
import { getClusterNames, isEmpty, isNumber, isString, readKubeConfig } from '../utils'

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

    private static instance: PromptsClass

    private cmds: any
    private args: any

    /**
     * @constructor
     */
    constructor(cmds?: any, args?: any) {
        this.cmds = (cmds || {})
        this.args = (args || {})
    }

    public static getInstance(cmds?: any, args?: any): PromptsClass {
        if (!PromptsClass.instance) {
            PromptsClass.instance = new PromptsClass(cmds, args)
        }
        return PromptsClass.instance
    }

    async input(prompt: PromptTypeOptions) {
        return await this.prompt({
            ...{ type: 'input' },
            ...prompt,
        })
    }

    async confirm(prompt: PromptTypeOptions) {
        return await this.prompt({
            ...{ type: 'confirm' },
            ...prompt,
        })
    }

    async list(prompt: PromptTypeOptions) {
        return await this.prompt({
            ...{ type: 'list' },
            ...prompt,
        })
    }

    async prompt({ type, message, choices, defaultValue, validate, afterMessage, flag }: PromptOptions) {
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

    public async getClusterName(providerName: string): Promise<string> {
        if (this.args?.clusterName
            && (isString(this.args.clusterName)
                && !isEmpty(this.args.clusterName))) {
            return this.args.clusterName
        }
        const kubeConfig = readKubeConfig()
        if (kubeConfig.clusters.length === 0) {
            return await this.input({
                message: 'Name of the cluster:',
                validate: (v) => this.inputValidation('arn', v)
            })
        } else {
            const clusterNames = Object
                .keys(getClusterNames())
                .filter((value) => {
                    const regex = (providerName === 'aws')
                        ? /^arn:[a-z0-9-]+:([a-z0-9-]+)?:[a-z0-9-]+:([0-9]{12}):([a-zA-Z0-9-_\/]+)?$/gm
                        : /gke_(.+?)_/g
                    return regex.test(value)
                })
            const choices = [...clusterNames, ...['[enter manually]']]
            let clusterName = await this.list({
                message: `Pick one of the ${kubeConfig.clusters.length} clusters found in '~/.kube/config':`,
                choices,
                defaultValue: kubeConfig.clusters[0],
                // validate: (v) => this.inputValidation('cluster-name', v)
            })
            if (clusterName ===  '[enter manually]') {
                clusterName = await this.input({
                    message: 'Name of the cluster:',
                    // validate: (v) => this.inputValidation('cluster-name', v)
                    validate: (value) => {
                        const arnRegex = /^arn:[a-z0-9-]+:([a-z0-9-]+)?:[a-z0-9-]+:([0-9]{12}):([a-zA-Z0-9-_\/]+)?$/gm
                        const result = arnRegex.test(value)
                        if (!result) {
                            console.log(`\n\rERROR: ARN '${value}' is invalid.`)
                        }
                        return result
                    }
                })
            }
            return clusterName
        }
    }

    public async getProviderAccountId(): Promise<string> {
        if (this.args?.providerAccountId
            && isNumber(this.args.providerAccountId)) {
            return this.args.providerAccountId
        }
        return await this.input({
            message: 'AWS Account ID:',
            validate: (v) => this.inputValidation('aws-account-id', v)
        })
    }

    public async getRegion(): Promise<string> {
        if (this.args?.region
            && (isString(this.args.region)
                && !isEmpty(this.args.region))) {
            // if (!this.cloudProviders.includes(this.cli.arguments.region)) {
            //     this.logger.error(`Region '${this.cli.arguments.region}' is invalid. Use either ${this.cloudProviders.join(', ')}`)
            //     process.exit(0)
            // }
            return this.args.region
        }
        return await this.list({
            message: 'Pick a region:',
            choices: ['eu-west-1'],
            // validate: (v) => this.inputValidation('aws-account-id', v)
        })
    }

    public async getProfilename(value?: any, defaultValue?): Promise<string> {
        if (!value) {
            return await this.input({
                message: 'Pick a name for the profile:',
                validate: (v) => this.inputValidation('profile-name', v)
            })
        }
        const confirm = await this.input({
            message: `Confirm '${value}' as profile name:`,
            validate: (v) => this.inputValidation('profile-name', v)
        })
        if (confirm) {
            return value
        } else {
            return await this.input({
                message: 'Pick a name for the profile:',
                validate: (v) => this.inputValidation('profile-name', v)
            })
        }
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
