import { UserIniConfigClass, UserIniCommandList } from './cmds/userIniConfig'
import { buildCommandList, commandNotFound } from './utils'
import { JSONObject } from './interfaces'

/**
 * @param {JSONObject} cmds
 * @param {string[]} args
 */
export const processCommands = async (cmds: JSONObject, args: any): Promise<void> => {

    if (cmds.length === 0) {
        commandNotFound()
    }

    const commandGroup: string = `${cmds[0]}-${cmds[1]}`
    const userIni: any = new UserIniConfigClass('.ncsrc', cmds, args)

    switch (true) {
        case buildCommandList(userIni.commandList).includes(commandGroup):
            await userIni.checkAndExecute(commandGroup)
            break
        default:
            commandNotFound()
            break
    }
}

