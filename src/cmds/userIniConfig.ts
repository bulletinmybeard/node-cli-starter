import * as ini from 'ini'
import * as fs from 'fs'

import { BaseClass } from './'

import {
    objectToObject,
    resolveHomeFolderPath,
    commandNotFound,
    isString,
} from '../utils'

interface UserIniArguments {
    name: string;
}

interface UserIniCommands {
    config: UserIniArguments;
}

export interface UserIniCommandList {
    actions: string[];
    commands: UserIniCommands;
}

/**
 * @class UserIniConfigClass
 */
export class UserIniConfigClass extends BaseClass {

    private readonly configName: string

    public readonly commandList: UserIniCommandList = {
        actions: ['set', 'unset', 'show'],
        commands: {
            config: {
                // Arguments
                name: '',
            },
        },
    }

    /**
     * @constructor
     */
    constructor(configName: string, cmds?: any, args?: any) {
        super(cmds, args)
        this.configName = configName
    }

    public async checkAndExecute(command: string): Promise<void> {

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
        this.logger.debug('[setConfigFile] prefix: ', prefix)
        this.logger.debug('[setConfigFile] profileName: ', profileName)

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
                this.logger.error('User config not found: ~/' + name)
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

            this.logger.debug('User config found: ~/' + name)
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
            this.logger.error('User config read error: ', err)
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
            this.logger.debug('User config created: ~/' + name)
        } catch (err) {
            this.logger.error('User config creation error: ', err)
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
                this.logger.debug('User config deleted: ~/' + name)
            } else {
                this.logger.debug('User config not found: ~/' + name)
            }
        } catch (err) {
            this.logger.error('User config deletion error: ', err)
            process.exit(0)
        }
    }
}
