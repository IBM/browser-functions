const jobId = urlParams.get('jobId')

function captureConsole() {
    const original = window.console
    window.console = {
        ...original,
        dir: (...args) => {
            window.opener.postMessage({ event: 'CONSOLE', message: args.join(' '), type: "LOG", jobId: jobId }, "*")
            original.log(...args)
        },
        log: (...args) => {
            window.opener.postMessage({ event: 'CONSOLE', message: args.join(' '), type: "LOG", jobId: jobId }, "*")
            original.log(...args)
        },
        warn: (...args) => {
            window.opener.postMessage({ event: 'CONSOLE', message: args.join(' '), type: "WARN", jobId: jobId }, "*")
            original.warn(...args)
        },
        error: (...args) => {
            window.opener.postMessage({ event: 'CONSOLE', message: args.join(' '), type: "ERROR", jobId: jobId }, "*")
            original.error(...args)
        }
    }
}

captureConsole();