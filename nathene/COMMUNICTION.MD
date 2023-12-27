# nathene-cummunication definition

> basics

- start of heading: `\u0001`
- start of message: `\u0002`
- end of message payload or heading: `\u0003`

---

## header definiton

1. headers are split with `;`
2. key-value pairs
3. syntax: `{{key}}:{{value}};`
4. keys include: `type, size, importance, compression, encryption`, types dictacte how payload gets unwrapped into objects, arrays, etc.
   1. type: `string, json, file, error`
      > _needed_
   2. size: `int` for the bytes
      > _optional_
   3. importance: `1 - 5` low to high
      > _optional_
   4. compression: `zlib`
      > _optional_
   5. encryption: `ssl`
      > _not supported yet_

> example message: `\u0001type:json;\u0003\u0002{hello: hello}` <br>
> parsing would result in the json object `{ hello: "hello" }`

## future

1. may be implement a way to open a second stream besides the normal parent stream for more data throughput / simoultanous throughput. Only when both sides agree the runtime will open a channel for them so they don't get type checked etc. May follow the same defintion as above. Will be written in the expermential branch further down the line. 
