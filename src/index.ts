#!/usr/bin/env node

import { printHelp, execCommand } from './cli-function'
import { readCLI } from './utils'

(async () => {
    /**
    * Read all commands and arguments first.
    */
    const { cmds, args, showHelp } = readCLI()

    if (Object.keys(cmds).length === 0
        || showHelp) {
        printHelp(cmds)
    }

    execCommand(cmds, args)

})().catch(err => {
    console.log(err)
    process.exit(0)
})
