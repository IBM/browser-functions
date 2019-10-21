#include <stdio.h>
#include <string.h>
#include "emscripten.h"

// This lets us write and call JavaScript from C code
EM_JS(void, jobCompleted, (char* ptr, int len), {
    let uint8Array = new Uint8Array(HEAPU8.subarray(ptr, ptr + len));
    jobCompleted(new TextDecoder("utf-8").decode(uint8Array))
});

int main(int argc, char * argv []) {
    char* key = strtok(argv[ 1 ], "=");
    char* value = strtok(NULL, "=");

    char result[80];
    strcpy(result, "Hello ");
    strcat(result, value);
    int len = sizeof(result) / sizeof(char);
    jobCompleted(result, len);

    return 0;
}
