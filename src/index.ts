#!/usr/bin/env node

import { processCommands } from './cli'
import { readCLIargs, IreadCLIargs, printHelp } from './utils'

(async () => {
    /**
    * Read all commands and arguments first.
    */
    const { cmds, args, showHelp }: IreadCLIargs = readCLIargs()

    if (Object.keys(cmds).length === 0
        || showHelp) {
        printHelp(cmds)
    }

    await processCommands(cmds, args)
})().catch(err => {
    console.log(err)
    printHelp()
})
