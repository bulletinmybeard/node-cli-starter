import { UserIniConfigClass } from './cmds/userIniConfig'
import { commandNotFound } from './utils'

const configName = '.ncsrc'

/**
 *
 * @param {string[]} cmds
 * @param {object} args
 */
export const processCommands = async (cmds: any, args: any) => {
    const commandGroup: string = `${cmds[0]}-${cmds[1]}`
    switch (commandGroup) {
        case 'set-config':
        case 'unset-config':
        case 'show-config':
            await UserIniConfigClass
                .getInstance(configName, cmds, args)
                .checkAndExecute(commandGroup)
            break
        default:
            commandNotFound(cmds, args)
    }
}

