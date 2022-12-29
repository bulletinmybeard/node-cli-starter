#!/usr/bin/env node

import { printHelp, execCommand } from './cli-functions'
import { readCLIargs } from './utils'

(async () => {
    /**
    * Read all commands and arguments first.
    */
    const { cmds, args, showHelp } = readCLIargs()

    if (Object.keys(cmds).length === 0
        || showHelp) {
        printHelp(cmds)
    }

    await execCommand(cmds, args)
})().catch(err => {
    console.log(err)
    process.exit(0)
})
