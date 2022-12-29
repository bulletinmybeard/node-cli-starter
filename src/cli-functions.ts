import { LoggerClass, readIniConfigFile, setIniConfigFile, deleteIniConfigFile } from './utils'

const logger = LoggerClass.getInstance()

const binaryName = 'kt'
const configName = '.ncsrc'
const actions: string[] = ['set', 'unset', 'show']
const commands = {
    config:{},
}

/**
 *
 * @param {object} cmds
 * @param {object} args
 */
export const execCommand = async (cmds: any, args: any) => {

    if (!actions.includes(cmds[0])) {
        commandNotFound(cmds, args)
    }

    if (!Object.keys(commands).includes(cmds[1])) {
        commandNotFound(cmds, args)
    }

    switch (`${cmds[0]}-${cmds[1]}`) {
        case 'set-config':
            await setIniConfigFile(configName, args)
            break
        case 'unset-config':
            await deleteIniConfigFile(configName)
            break
        case 'show-config':
            await readIniConfigFile(configName, cmds)
            break
        default:
            commandNotFound(cmds, args)
    }
}

const commandNotFound = (cmds, args, format: string = 'text') => {
    logger.debug('Command not found')
    printHelp(cmds, format)
}

export const printHelp = (cmds, format: string = 'text'): void => {

    // switch (format) {
    //     case 'json':
    //         console.log(util.inspect({
    //             ...{ version },
    //         }))
    //         break
    //     case 'yaml':
    //         break
    //     case 'text':
    //     default:
    //         // const commandList = this.commandList
    //         // const globalArgs = this.commandList['_'].args
    //
    //         // Object
    //         //     .entries(commandList)
    //         //     .forEach(([key, value]) => {
    //         //         if (key === '_') {
    //         //             return
    //         //         }
    //         //         console.log(`# ${value['desc']}`)
    //         //         Object
    //         //             .entries(value = {...globalArgs, ...value['args']})
    //         //             .forEach(([key_, value_]) => {
    //         //                 console.log(`${binName} ${key} --${key_} // ${value_['desc']}`.trim())
    //         //             })
    //         //         console.log()
    //         //     })
    //         break
    // }

    process.exit(0)
}
