# QuickStart

Browser Functions consists of a server component (written in NodeJS), and one or more browser execution environments - Chrome, Chromium, or Firefox instances usually running headlessly, connected to the server.

## Write and deploy to an existing server

The quickest way to get started is to write a function and deploy it to a running Browser Functions server.

- Login to the server (e.g. `browserfunctions.com`), create new credentials if you don't already have one
- Click to create a new function with name `myfunc.js` with the following content (or drag in an already-created file):

```javascript
function main(args) {
  return "Hello, " + (args.name || "world");
}
```
- Execute the function by opening the URL shown in the list, in a browser, e.g. `https://examples.browserfunctions/execute/hello/function.js`, and the function should respond with `Hello, world`.
- Pass in a `name` argument in the URL: `https://examples.browserfunctions/execute/hello/function.js?name=Toby`, and the function should respond with `Hello, Toby`
- See the [API](?api.md) documentation for more details on creating your own functions.
- You can also view and execute the [example](https://examples.browserfunctions.com/?access-key=examples) functions

## Testing and Debugging your function

You can test and develop your function by using a local browser and it's developer console. Use a supported browser (Chrome, Firefox) and open the developer console, then visit the appropriate URL as below. The results (and errors) of the function execution are displayed in the developer console. The full [API](?api.md) is available even when developing locally, although some things may behave differently, e.g. no request headers, the default environment being "development", etc.

### Local static development

You can write a function and execute it without the need for the Browser Function server at all. Only a static local web server is needed. Steps to do this:

- Download [this ZIP](https://github.ibm.com/Browser-Backend/browser_backend/archive/master.zip) file and unzip it to a local folder.
- Start a local web server in the folder, e.g. run `python -m http.server`. 
- Place your function into the `functions_root` folder (e.g. `hello.js`).

You can now execute and debug your function by opening the local URL in a browser (and specifying the function name in the `bf` URL parameter), e.g. `http://localhost:8000?bf=hello.js` - arguments can be passed as additional URL parameters.

## Installing your own server

See the [Install](?install.md) section for how to install Browser Functions on your local development machine, or onto your own server
