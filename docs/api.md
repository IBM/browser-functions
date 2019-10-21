API
===
[TOC]

## Supported file types

The following are supported file types for direct execution:

- `.html`: an HTML file which must contain a JavaScript `main()` function. It should not contain the `<!DOCTYPE>`, `<HTML>`, `<HEAD>`, or `<BODY>` tags, because Browser Functions will insert this HTML file into a template that contains the full HTML boilerplate. Your HTML file can include (locally or from external URLs) scripts, images, CSS, or even a compiled Web Assembly binary with it's generated JavaScript glue code.
- `.js`: a plain JavaScript file, which must contain a `main()` function. You can `import` other scripts within your JavaScript file.

## Environment

Environment variables can be saved into a file named `environment.json` in the root folder of your application. This file should contain a root JSON object containing keys for each environment and the values containing the actual environment variables, e.g.

```
{
    "development": {
        "db_url": "http://database.dev"
    },
    "production": {
        "db_url": "http://database.prod"
    }
}
```

The `development` and `production` environment names are special (although you can create as many other environments as you like), the former is used when developing locally, and the latter is used automatically on the server. You can specify which environment to execute your function in, per request, by setting the `Execution-Environment` header in your request, e.g. `curl -H "Execution-Environment: development" https://...`

The contents of the relevant environment are passed to the function inside the `env` property of the second argument of the `main` method. An example usage of the above environment file in a JavaScript function would be:

```
function main(args, metadata) {
    return "Database URL is " + metadata.env.db_url;
}
```

## JavaScript

### main()
A function named `main` must exist in the global scope. This function can return a promise, regular object, or a scalar value.

```javascript
function main(args, metadata) {
}
```

- `args` \<Object> User arguments passed to the function as query parameters for GET or as a JSON payload for POST.
- `metadata` \<Object> Object describing the environment under which the function has run.
    - `request.headers`  \<Object<String,String>> Headers sent of the request
    - `request.method`  \<String> The method used (GET, POST, PUT etc) 
    - `env`  \<Object> User defined environment variables (see Environment section)
- Returns: Any Object, scalar value, Iterator/Generator, or Promise

The `main` function can also be a generator, and the results are streamed back to the client as they are yielded, e.g.

```javascript
async function* main(args, metadata) {
    for (let i=0; i < 10; i++) {
        await sleep(1000)
        yield i
    }
}
```

### setStatus(code)
Set the response HTTP status code. This must be set before any data is sent back to the client.

- `code` \<Number> The HTTP status code to set, e.g. 200
- Returns void

### setHeader(name, value)
Set a response HTTP header. This must be set before any data is sent back to the client.

- `name` \<String> The name of the header to send, e.g. "Content-Type"
- `value` \<String> The value of the header to send, e.g. "text/plain"
- Returns void

### jobStream(result)
Send data to the client immediately without waiting for the function to return.

- `result` \<Object>|\<string> A value to return from the function. This follows the same rules as values returned from the main() function
- Returns void

### jobCompleted(result)
Send data to the client and end execution of the function. You should not normally call this function directly, but rather return the result from the `main()` method.

- `result` \<Object>|\<string> A value to return from the function. This follows the same rules as values returned from the main() function
- Returns void

### jobError(error)
Send data to the client with a 500 response code.

- `error` \<Object>|\<string>|\<Error> A value to return from the function. This follows the same rules as values returned from the main() function
- Returns void


### watchdogReset()
Reset the timer that kills the worker tab if it is unresponsive for more than 1 second. You should not need to call this function directly - it is used internally by Browser Functions. As long as your function doesn't hang the main thread (i.e. uses `await`, uses Promises, or calls `sleep()` periodically), it can continue executing for as long as needed.

- Returns void

### sleep(ms)
Sleep for a period of time while allowing background tasks to execute. Returns a Promise, so your function must await the result for the sleep to take effect. Calling this function also yields control back to the browser, which will prevent the watchdog from killing the tab for being unresponsive.

- `ms` \<Number> sleep period in milliseconds
- Returns a promise that resolves after the given milliseconds

```javascript
await sleep(2000)
```
