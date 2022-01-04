# Master Runtime

> implemented in GO

## config.json

- ServerDirectory: `string`

  > path to core servers

- Servers: `object`

  - WindowServer: `object`
    - name: `string`
      > name of the directory the files lay
    - platform: `string`
      > platform the extension needs to be run with. <br> acceptable values are all listed from the `Runtimes object`
  - UIServer: `object`
    > same as `WindowServer object`
  - FileServer: `object`
    > same as `WindowServer object`

- Runtimes: `object`
  - {{name_of_the_runtime}}: `object`
    - prefix: `string`
      > can be e.g. the path to the executable runtime
    
