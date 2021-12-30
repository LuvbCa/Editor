# Documentation

## emit events

> every function except for the `onPluginRegistered` function, has a value `this.answer(type: string, ...args: any[])` which it can answer with.

valid answer type include: 

- `updateHiglighting`:  

---

> a plugin needs to export two functions:

- onPluginRegistered

  - identifer: `function`
    - uuid: `string` identifier that is put in every request
    - name: `string` assigned name of plugin

- errorHandler: `function`
  - type: `string` type of error
  - _**optional**_ detail: `string` detail for the error
