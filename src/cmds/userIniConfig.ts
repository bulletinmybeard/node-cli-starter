import * as ini from 'ini'
import * as fs from 'fs'

import {
    objectToObject,
    PromptsClass,
    resolveHomeFolderPath,
    commandNotFound,
    isString,
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

    public readonly commandList = {
        actions: ['set', 'unset', 'show'],
        commands: {
            config: {
                name: '',
            },
        },
    }

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

        if (!this.commandList.actions.includes(this.cmds[0])) {
            commandNotFound(this.commandList)
        }

        if (!Object.keys(this.commandList.commands).includes(this.cmds[1])) {
            commandNotFound(this.commandList)
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
        let prefix
        let profileName
        if (cmds.length === 3
            && (isString(cmds[2]) && cmds[2].length > 1)) {
            if (cmds[2].indexOf(':') > -1) {
                ([prefix, profileName] = cmds[2].split(':'))
            } else {
                profileName = cmds[2]
            }
        }
        console.log('[setConfigFile] prefix: ', prefix)
        console.log('[setConfigFile] profileName: ', profileName)

        if (!profileName) {
            await this.prompts.input({
                message: 'Name of the profile:',
                validate: (input) => this.prompts.inputValidation('profileName', input)
            })
        } else if (profileName && !this.prompts.inputValidation('profileName', profileName)) {
            process.exit(0)
        }
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
                const profile = await this.prompts.list({
                    message: 'Pick a profile:',
                    choices: Object.keys(userConfig).filter((profile) => profile !== 'global')
                })
                console.log(userConfig[profile])
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
}
