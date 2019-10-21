# Running C code using webassembly

The example includes a compiled wasm file already. To compile your own code, set up [emscripten](https://emscripten.org/) for compiling c code to WebAssembly.

Compile the example:
```shell script
emcc hello.c -s WASM=1 -o hello.js -s "EXTRA_EXPORTED_RUNTIME_METHODS=['callMain']" 
```
