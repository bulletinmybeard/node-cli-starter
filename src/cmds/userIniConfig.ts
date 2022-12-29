import * as ini from 'ini'
import * as fs from 'fs'

import {
    objectToObject,
    PromptsClass,
    resolveHomeFolderPath,
    commandNotFound,
    printHelp
} from '../utils'

/**
 * @class UserIniConfigClass
 */
export class UserIniConfigClass {

    private static instance: UserIniConfigClass

    private readonly cmds: string[]
    private readonly args: any
    private readonly prompts: any
    private readonly configName: string

    /**
     * @constructor
     */
    constructor(configName: string, cmds?: any, args?: any) {
        this.configName = configName
        this.cmds = (cmds || [])
        this.args = (args || {})
        this.prompts = PromptsClass.getInstance(this.cmds, this.args)
    }

    public static getInstance(configName: string, cmds?: any, args?: any): UserIniConfigClass {
        if (!UserIniConfigClass.instance) {
            UserIniConfigClass.instance = new UserIniConfigClass(configName, cmds, args)
        }
        return UserIniConfigClass.instance
    }

    public async checkAndExecute(command: string) {

        const actions: string[] = ['set', 'unset', 'show']
        const commands = {
            config:{},
        }

        if (!actions.includes(this.cmds[0])) {
            commandNotFound(this.cmds, this.args)
        }

        if (!Object.keys(commands).includes(this.cmds[1])) {
            commandNotFound(this.cmds, this.args)
        }

        switch(command) {
            case 'set-config':
                await this.setIniConfigFile(this.configName, this.cmds, this.args)
                break
            case 'unset-config':
                await this.deleteIniConfigFile(this.configName)
                break
            case 'show-config':
                await this.readIniConfigFile(this.configName, this.cmds)
                break
        }
    }

    /**
     * Reads the config file within the user its home directory.
     * @param {string} name
     * @param {object} cmds
     * @param {object} args
     * @return {object}
     */
    public async setIniConfigFile(name: string, cmds: any, args: any) {
        console.log('[setConfigFile]')
        console.log('[setConfigFile] name: ', name)
        console.log('[setConfigFile] cmds: ', cmds)
        console.log('[setConfigFile] args: ', args)

        const test = await this.prompts.input({
            message: 'Name of the cluster:',
            validate: (v) => this.prompts.inputValidation('arn', v)
        })
        console.log('test____________: ', test)
    }

    /**
     * Reads the config file within the user its home directory.
     * @param {string} name
     * @param {object} cmds
     * @return {void}
     */
    public async readIniConfigFile(name: string, cmds: any): Promise<void> {
        const configFilePath = resolveHomeFolderPath('~/' + name)
        try {
            if (!fs.existsSync(configFilePath)) {
                console.log('User config not found: ~/' + name)
                process.exit(0)
            }
            const config = objectToObject(ini.parse(fs.readFileSync(configFilePath, 'utf8')))
            const userConfig = Object
                .entries(config)
                .reduce((acc, [name, profile]) => {
                    const profileName = name.replace(/profile\s+/, '')
                    acc[profileName] = profile
                    return acc
                }, {})
            console.log('User config found: ~/' + name)
            if (cmds.length === 3
                && (cmds[2] in userConfig)) {
                console.log(userConfig[cmds[2]])
            } else {
                console.log(userConfig)
            }
        } catch (err) {
            console.log('User config read error: ', err)
            process.exit(0)
        }
    }

    /**
     * Writes the config file within the user its home directory.
     * @export
     * @param {string} name
     * @param {object} data
     * @return {void}
     */
    public async writeIniConfigFile(name: string, data: any): Promise<void> {
        const configFilePath = resolveHomeFolderPath('~/' + name)
        try {
            fs.writeFileSync(configFilePath, ini.stringify(data), {
                encoding: 'utf8'
            })
            console.log('User config created: ~/' + name)
        } catch (err) {
            console.log('User config creation error: ', err)
            process.exit(0)
        }
    }

    /**
     * Deletes the config file within the user its home directory.
     * @export
     * @param {string} name
     * @return {void}
     */
    public async deleteIniConfigFile(name: string): Promise<void> {
        const configFilePath = resolveHomeFolderPath('~/' + name)
        try {
            if (fs.existsSync(configFilePath)) {
                fs.unlinkSync(configFilePath)
                console.log('User config deleted: ~/' + name)
            } else {
                console.log('User config not found: ~/' + name)
            }
        } catch (err) {
            console.log('User config deletion error: ', err)
            process.exit(0)
        }
    }

    public commandNotFound(cmds, args, format: string = 'text') {
        console.log('Command not found')
        printHelp(cmds, format)
    }
}
