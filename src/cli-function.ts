import { LoggerClass } from './utils'

const logger = LoggerClass.getInstance()

const binaryName = 'kt'
const actions: string[] = ['set', 'unset', 'show']
const commands = {
    config:{},
}

/**
 *
 * @param {object} cmds
 * @param {object} args
 */
export const execCommand = (cmds: any, args: any) => {

    if (!actions.includes(cmds[0])) {
        commandNotFound(cmds, args)
    }

    if (!Object.keys(commands).includes(cmds[1])) {
        commandNotFound(cmds, args)
    }

    switch (`${cmds[0]}-${cmds[1]}`) {
        case 'set-config':
            logger.debug('cmd: set-config: ', cmds[2])
            break
        case 'unset-config':
            logger.debug('cmd: unset-config: ', cmds[2])
            break
        case 'show-config':
            logger.debug('cmd: show-config: ', cmds[2])
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
