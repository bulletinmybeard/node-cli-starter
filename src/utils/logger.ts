import {isObject, isUndefined, objectToMap} from './'
import * as clc from 'cli-color'

/**
 * Supported log levels.
 * @enum
 */
export enum LogLevel {
    error,
    warn,
    info,
    debug,
    none,
}

const stylesNode: any = objectToMap({
    log: 'greenBright',
    debug: 'blueBright',
    info: 'yellowBright',
    warn: 'magentaBright',
    error: 'redBright',
    note: 'greenBright',
    table: 'yellowBright',
})

/**
 * Logger Class that provides identical methods to the known `console.*` methods.
 * @class LoggerClass
 */
export class LoggerClass {
    /**
     * Default `log level` is currently set to `error` and shows all log levels.
     * @private
     * @type {number}
     */
    private _level: number

    /**
     * Holds the supported log levels.
     * @readonly
     * @private
     * @type {string[]}
     */
    private readonly _logLevels: string[]

    /**
     * Default log level set to 'log'.
     * @readonly
     * @private
     * @type {string}
     */
    private readonly _defaultTargetLevel: string

    /**
     * Module options, coming from the main SDK Class.
     * @private
     * @type {any}
     */
    private _options: any

    /**
     * @constructor
     */
    constructor(options?: any) {
        this._level = LogLevel.debug

        /**
         * Merge module config from global SDK config against defaults.
         */
        this.options = {...{
            levelStrict: false,
            level: this._level,
        }, ...options}

        this._logLevels = [
            'error',
            'warn',
            'info',
            'debug',
            'none',
        ]
        this._defaultTargetLevel = 'log'
        this.validateAndUpdateLogLevel()
    }

    /**
     * Process the log level, format the optional log data and apply styles to it.
     *
     * @private
     * @param {string} targetLevel
     * @param {string} message
     * @param {any?} data
     * @param {any?} options
     * @return {void}
     */
    private _buildLog(targetLevel: string, message: string, data?: any, options?: any): void {
        try {
            const orgTargetLevel = (typeof targetLevel === 'string') ? targetLevel.toLowerCase() : 'debug'
            const hasTable = (typeof targetLevel === 'string' && targetLevel.toLowerCase() === 'table')

            targetLevel = (hasTable)
                ? 'debug'
                : targetLevel

            /**
             * Making sure to always use the designated `console` methods available.
             */
            targetLevel = (['info', 'warn', 'error'].includes(`${targetLevel}`.toLowerCase()))
                ? targetLevel.toLowerCase()
                : (targetLevel || this._defaultTargetLevel)

            /**
             * The default target `log` (e.g., this.logger.log(‘hello-space’) will always be shown,
             * whereas other targets (e.g., info, warn, debug, or error)
             * will be checked against the target level.
             */
            if (targetLevel !== this._defaultTargetLevel
                && !this._showLog(LogLevel[targetLevel])) {
                return
            }

            /**
             * Apply console styles.
             */
            let stls: string = stylesNode.has(targetLevel)
                ? stylesNode.get(targetLevel)
                : ''

            /**
             * Since `console.debug` is not visible by default in the browser’s console,
             * we will fallback to `console.log` for the target level `debug`.
             */
            const logType: string = ((targetLevel === 'debug')
                ? this._defaultTargetLevel
                : `${targetLevel || this._defaultTargetLevel}`).toLowerCase()

            if (!isUndefined(data)) {
                if (isObject(data)) {
                    if ((('message' in data) && ('name' in data) && ('stack' in data))
                        || data instanceof Error) {
                        // ...
                        try {
                            // data.stack = (this.sdk.isProd())
                            //     ? '[production/no-error-stack]'
                            //     : data?.stack
                        } catch (err) { /** ignore **/ }
                    }
                }
                if (hasTable) {
                    console.info(clc[stls](`[${orgTargetLevel.toUpperCase()}])`), message)
                    console.table(data)
                } else {
                    console[logType](clc[stls](`[${orgTargetLevel.toUpperCase()}]`), message, data)
                }
            } else {
                if (!(stls in clc)) {
                    stls = 'blueBright'
                }
                console[logType](clc[stls](`[${orgTargetLevel.toUpperCase()}]`), message)
            }
        } catch (err) {
            console.log(`[Logger::_buildLog()] error:`, err)
        }
    }

    /**
     * Same as `logger.debug` but without the log level check and optional options!
     *
     * @public
     * @param {string} message
     * @param {any?} data
     * @param {any?} options
     * @return {void}
     */
    public log(message: any, data?: any, options?: any): void {
        this._buildLog('log', message, data, options)
    }

    /**
     * Show message and data arguments with `console.log`
     *
     * @public
     * @param {string} message
     * @param {any?} data
     * @return {void}
     */
    public debug(message: any, data?: any): void {
        this._buildLog('debug', message, data)
    }

    /**
     * Show message and data arguments with `console.info`
     *
     * @public
     * @param {string} message
     * @param {any?} data
     * @return {void}
     */
    public info(message: any, data?: any): void {
        this._buildLog('info', message, data)
    }

    /**
     * Show message and data arguments with `console.warn`
     *
     * @public
     * @param {string} message
     * @param {any?} data
     * @return {void}
     */
    public warn(message: any, data?: any): void {
        this._buildLog('warn', message, data)
    }

    /**
     * Show message and data arguments with `console.error`
     *
     * @public
     * @param {string} message
     * @param {any?} data
     * @return {void}
     */
    public error(message: any, data?: any): void {
        this._buildLog('error', message, data)
    }

    /**
     * Shows an object or array with `console.table`
     *
     * @public
     * @param {string} message
     * @param {any?} data
     * @return {void}
     */
    public table(message: any, data?: any): void {
        this._buildLog('table', message, data)
    }

    /**
     * Determines whether the log should be shown based on the current and target log level.
     *
     * @public
     * @param {number} targetLevel
     * @return {boolean}
     */
    private _showLog(targetLevel: number): boolean {
        if (this.options.levelStrict) {
            return (targetLevel === this._level)
        } else {
            return (targetLevel >= this._level)
        }
    }

    /**
     *  Getting the log level number.
     * @return {number}
     */
    get level(): number {
        return this._level
    }

    /**
     * Setting the log level by either log level name or number.
     *
     * @examples
     * this.logger.level('debug') > 'debug' > console.log
     * this.logger.level(2') > 'info' > console.info
     *
     * @param {string|number} level
     */
    set level(level: number) {
        this._level = level
    }

    /**
     * Getting the log level name.
     * @return {string}
     */
    get levelName(): string {
        return LogLevel[this._level]
    }

    /**
     * To overwrite the default log level, the level can be passed to the SDK options.
     *
     * @examples
     *
     * # Disable all console logs except `this.logger.log()`.
     * const sdk = new GamedockSDK('com.spilgames.tappyplane', {
     *   logger: {
     *     level: 'none',
     *   },
     * })
     *
     * # Change the default log level to `debug` (`this.logger.log()` remains shown!).
     * const sdk = new GamedockSDK('com.spilgames.tappyplane', {
     *   logger: {
     *     level: 'debug',
     *   },
     * })
     *
     *
     * # Only show `this.logger.debug()` and `this.logger.log()` logs
     * const sdk = new GamedockSDK('com.spilgames.tappyplane', {
     *   logger: {
     *     level: 'debug',
     *     levelStrict: true,
     *   },
     * })
     *
     * @public
     */
    public validateAndUpdateLogLevel() {
        if (this.options.level) {
            const lvl: string = this.options.level
            const logLevel: string = (typeof lvl === 'string')
                ? lvl.toLowerCase()
                : (typeof lvl === 'number')
                    ? LogLevel[lvl]
                    : undefined
            const targetLogLevelName = this._logLevels.includes(logLevel)
                ? logLevel
                : undefined
            if (isUndefined(targetLogLevelName)) {
                this.error(`Log level '${logLevel}' found in SDK options is invalid`)
                this.info(`Log level remains unchanged ('${this.levelName}'`)
            } else {
                if (targetLogLevelName === this.levelName) {
                    this.info(`Desired log level '${this.levelName}' is identical to current default level '${targetLogLevelName}' (skip log level change)`)
                } else {
                    this.info(`Changing Log level from '${this.levelName}' to '${targetLogLevelName}'`)
                    this.level = LogLevel[targetLogLevelName]
                    this.log('LogLevel changed to:', this.levelName)
                }
            }
            // this.log('LogLevelStrict set to:', this.options.levelStrict)
        }
    }

    /**
     * Set the options for each Module that extends the Base Class.
     * @public
     * @param {object} values
     * @return {void}
     */
    set options(values: any) {
        this._options = values
    }

    /**
     * Get the Module options.
     * @public
     */
    get options(): any {
        return this._options
    }
}
