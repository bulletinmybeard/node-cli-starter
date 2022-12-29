#!/usr/bin/env node

import { processCommands } from './cli-functions'
import { readCLIargs, printHelp } from './utils'

(async () => {
    /**
    * Read all commands and arguments first.
    */
    const { cmds, args, showHelp } = readCLIargs()

    if (Object.keys(cmds).length === 0
        || showHelp) {
        printHelp(cmds)
    }

    await processCommands(cmds, args)
})().catch(err => {
    console.log(err)
    printHelp()
})
