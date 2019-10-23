# Browser Functions

Browser Functions is a platform for running functions inside a browser, on a server. Any code executable by a modern browser, such as HTML, JavaScript, CSS, or even Web Assembly, can be executed inside Browser Functions. The functions are actually executed within tabs inside a browser (e.g. Chrome or Firefox). This means that front-end code can be used directly in the backend. Browser Functions can be used as a regular application server, or as a serverless platform.

# Why would you use it?

Browser Functions can be used as a serverless platform. If you are hosting your own serverless solution, Browser Functions may provide a platform that is cheaper to host compared to standard serverless platforms. It is quick and easy to get [up and running](?install.md), and is very lightweight compared to other solutions, leading to much [better performance](?performance.md) (or conversely, much lower resource utilization). Unlike other serverless platforms, there isn't a cold-start penalty, so there isn't a need to keep resource-hungry containers running.

As a developer, you may consider using Browser Functions if you are familiar with web front-end development. You can use the same web API's and code you use on the front-end in Browser Functions to create your own RESTful API's - all that is required is a `main()` JavaScript function to return the results. Best of all, you can take advantage of the latest web API's, since Browser Functions uses very recent versions of Chrome and Firefox.

You may be wondering why you wouldn't just run those functions on the client browsers. Running the code on a hosted server is useful when you need to:

- hide credentials (e.g. database login or API keys) from the client
- run the function on a trigger (e.g. on a schedule, or via Webhooks)
- expose private cloud data to public (i.e. the function runs inside a private network)
- work around [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) restrictions (i.e. proxy clients through the server)
- have the function be consumed by non-browsers (e.g. mobile apps, embedded devices)
- pre-render content for old browsers, embedded devices, smart watches, etc. (e.g. render an SVG, return the image)
- add a caching layer to a rate-limited external API (e.g. twitter)

## Documentation and examples

You can view the [documentation](docs/index.md) describing how to manage and use Browser Functions, and also view [examples](/functions_root/examples/files) of functions that can be executed on the platform.

## Contributing

Please view the [contribution guidelines](CONTRIBUTING.md).
