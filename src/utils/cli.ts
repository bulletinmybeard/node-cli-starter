import { execSync } from 'child_process'
import * as fs from 'fs'
import * as os from 'os'

import { convertString, isUndefined, typecast } from './'
import { JSONObject } from '../interfaces'

interface IfileFolderStats {
    exists: boolean;
    type?: string;
}

export interface IreadCLIargs {
    cmds: string[];
    args: JSONObject;
    showHelp: boolean;
}

/**
 * Identifies a path.
 * @export
 * @param {string} sourceFolder
 * @return {IfileFolderStats}
 */
export const fileFolderStats = (sourceFolder: string): IfileFolderStats => {
    try {
        const stats: fs.Stats = fs.statSync(sourceFolder);
        if (stats.isDirectory()) {
            return { exists: true, type: 'dir' }
        } else {
            return { exists: true, type: 'file' }
        }
    } catch (error) {
        return { exists: false }
    }
}

/**
 * Execute shell command.
 * @export
 * @param {string} command
 * @param {object} options
 * @return {string}
 */
export const cliExecSync = (command: any[], options = {}): string => {
    try {
        return execSync(command.join(' '), {
            ...{
                maxBuffer: (1024 * 4096),
                env: process.env,
            },
            ...options
        }).toString()
    } catch (error) {
        if (command.includes('kubectl')) {
            return error.stdout.toString()
        }
        console.log('[cliExecSync] error: ', error)
        process.exit(0)
    }
}

/**
 * Resolve the user its `home` path.
 * @export
 * @param {string} folderPath
 * @return {string}
 */
export const resolveHomeFolderPath = (folderPath: string): string => {
    if (folderPath.startsWith('~')) {
        return folderPath.replace('~', os.homedir())
    }
    return folderPath
}

/**
 * Read all CLI commands and arguments.
 * @export
 * @return {JSONObject}
 */
export const readCLIargs = (): IreadCLIargs => {
    /**
     * Lowercase all arguments.
     */
    const args: string[] = (process.argv)
        .slice(2)
        .map(arg =>
            `${arg}`.toLowerCase().trim())

    /**
     * Read alls `commands` that don't start with `--` but can contain a single dash.
     */
    const commands: string[] = args
        .reduce((cmds, cmd): any => {
            if (cmd &&
                cmd.indexOf('--') === -1) {
                const matches: string[] | null = cmd.match(new RegExp('^([\:-a-z]+)$', 'i'))
                if (matches !== null) {
                    cmds.push(cmd)
                }
            }
            return cmds
        }, [])

    /**
     * Read all optional `arguments` that start with `--`.
     */
    const convertedArgs: JSONObject = args
        .reduce((args, arg): any => {
            if (arg) {
                const matches: string[] | null = arg.match(new RegExp('^--([-a-z]+)=?(.*)?$', 'i'))
                if (matches !== null) {
                    let [, key, value] = matches
                    key = convertString(key)
                    if (!isUndefined(value)) {
                        /**
                         * Typecast items from comma separated values
                         * and return them as an Array.
                         */
                        args[key] = (value.indexOf(',') > 0)
                            ? value
                                .split(',')
                                .map(val => typecast(val))
                            : typecast(value)
                    } else {
                        /**
                         * If the `value` is missing we talking here `boolean`,
                         * and set the value to `true`.
                         *
                         * E.g., `--no-cache` or `--no-cache=false`
                         */
                        args[key] = true
                    }
                }
            }
            return args
        }, {})

    return {
        cmds: commands,
        args: convertedArgs,
        /**
         * Just a helper...
         */
        showHelp: (('help' in convertedArgs)
            || commands.includes('help')),
    }
}

export const commandNotFound = (commandList?: any, format: string = 'text'): void => {
    console.log('Command not found')
    printHelp(commandList, format)
}

export const printHelp = (commandList?: any, format: string = 'text'): void => {
    process.exit(0)
}

export const buildCommandList = (commandList: JSONObject): string[] => {
    if (!commandList?.commands) {
        throw Error(`[buildCommandList] commands not found in 'commandList'`)
    }
    if (!commandList?.actions) {
        throw Error(`[buildCommandList] actions not found in 'commandList'`)
    }
    return Object
        .entries(commandList.commands)
        .reduce((acc, [command]) => {
            (commandList.actions).forEach(action => {
                acc.push(action +'-'+ command)
            })
            return acc
        }, [])
}
