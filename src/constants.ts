export const KUBECTL_CMDS: any = {
    GET_CONTEXTS: [
        'kubectl',
        'config',
        'get-contexts',
    ],
    GET_CONFIG: [
        'kubectl',
        'config',
        'view',
        '-o',
        'json'
    ],
}
