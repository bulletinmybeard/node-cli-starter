import { execSync } from 'child_process'
import * as fs from 'fs'
import * as os from 'os'

import { convertString, isUndefined, typecast } from './'
import { KUBECTL_CMDS } from '../constants'

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
export const readCLIargs = (): any => {
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

export const readKubeConfig = () => {
    let stdout = cliExecSync(KUBECTL_CMDS.GET_CONFIG)
    if (!stdout) {
        console.log(`Command '${KUBECTL_CMDS.GET_CONFIG}' error.`)
        process.exit(0)
    }
    stdout = JSON.parse(stdout)
    return {
        ...stdout,
        ...{
            clusters: stdout.clusters.map(cluster => cluster.name),
            // 'current-context': stdout?.['current-context']
        },
    }
}

export const getClusterNames = () => {
    const stdout = cliExecSync(KUBECTL_CMDS.GET_CONTEXTS)
    if (!stdout) {
        return []
    }
    return stdout
        .split('\n')
        .reduce((acc, line, idx) => {
            line = line.trim()
            if (`${line}`.length > 0
                && idx > 0) {
                const [currentName, cluster, authInfo, namespace] = line.split(/\s+/)
                acc[cluster] = {
                    currentName,
                    authInfo,
                    namespace,
                }
            }
            return acc
        }, {})
}

/**
 * Run Docker login command.
 *
 * @example
 * this.runDockerLogin('aws', 'eu-west-1', 070514396465)
 * this.runDockerLogin('gcp', 'europe-west1', 'az-bi-web-prd')
 *
 * @param {string} provider
 * @param {string} region
 * @param {string} id
 */
export const runDockerLogin = (provider: string, region: string, id: string | number) => {
    const command: string[] = (provider === 'aws')
        ? [
            'aws',
            'ecr',
            'get-login-password',
            '--region',
            region,
            '|',
            'docker',
            'login',
            '--username',
            'AWS',
            '--password-stdin',
            `${id}.dkr.ecr.${region}.amazonaws.com`,
        ]
        : [
            'gcloud',
            'auth',
            'configure-docker',
            region
        ]
    const stdout = cliExecSync(command)
    console.log('[runDockerLogin] stdout: ', stdout)
    return stdout
}


export const commandNotFound = (cmds, args, format: string = 'text') => {
    console.log('Command not found')
    printHelp(cmds, format)
}

export const printHelp = (cmds?: any, format: string = 'text'): void => {

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
