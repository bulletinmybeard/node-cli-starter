# node-cli-starter
Starter repository for building command line script with Node.js

## Install dependencies
```shell
$ pnpm install
```

## Build the CLI app
```shell
$ pnpm run build
```

## Test the Node CLI app
The starter comes with options to read, write, and delete the user config file `~/.ncsrc` and its groups/profiles.

```shell
[global]

[export]
target_dir="~/exports"
protect="true"

[transcode]
format="mp3"
bitrate="128kb"
```

### Show the user config
```shell
$ ts-node src/index.ts show config

Pick a group/profile:
(Use arrow keys to scroll through list)

export
transcode
```

### Show the user config group/profile `export`
```shell
$ ts-node src/index.ts show config export

{
  target_dir: '~/exports',
  protect: true
}
```

### Show the user config group/profile `transcode`
```shell
$ ts-node src/index.ts show config transcode

{
  format: 'mp3',
  bitrate: '128kb'
}
```
