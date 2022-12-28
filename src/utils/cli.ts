import { execSync } from 'child_process'
import * as fs from 'fs'
import * as os from 'os'
import * as ini from 'ini'
import { objectToObject, convertString, isUndefined, typecast } from './'

/**
 * Reads the config file within the user its home directory.
 * @param {string] }name
 * @return {object}
 */
export const readConfigFile = (name: string) => {
    const configFilePath = resolveHomeFolderPath('~/' + name)
    try {
        const config = objectToObject(ini.parse(fs.readFileSync(configFilePath, 'utf8')))
        const userConfig = Object
            .entries(config)
            .reduce((acc, [name, profile]) => {
                const profileName = name.replace(/profile\s+/, '')
                acc[profileName] = profile
                return acc
            }, {})
        console.log('User config found: ~/' + name)
        return userConfig
    } catch (err) {
        console.log('User config read error: ', err)
        process.exit(0)
    }
}

/**
 * Identifies a path.
 * @param {string} sourceFolder
 */
export const fileFolderStats = (sourceFolder: string): any => {
    try {
        const stats = fs.statSync(sourceFolder);
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
 * @param {string} command
 * @param {object} options
 */
export const cliExecSync = (command: any[], options = {}): any => {
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
 */
export const readCLI = (): any => {
    /**
     * Lowercase all arguments.
     */
    const args = (process.argv)
        .slice(2)
        .map(arg =>
            `${arg}`.toLowerCase().trim())

    /**
     * Read alls `commands` that don't start with `--` but can contain a single dash.
     */
    const commands = args
        .reduce((cmds, cmd): any => {
            if (cmd &&
                cmd.indexOf('--') === -1) {
                const matches: string[] | null = cmd.match(new RegExp('^([-a-z]+)$', 'i'))
                if (matches !== null) {
                    cmds.push(cmd)
                }
            }
            return cmds
        }, [])

    /**
     * Read all optional `arguments` that start with `--`.
     */
    const convertedArgs = args
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
