# Install

[TOC]

## Installation

If you want to run the server locally (or on your own server), install it as follows:

- Download [this ZIP](https://github.com/IBM/browser-functions/browser_backend/archive/master.zip) file and unzip it to a folder.
- In the folder, run `npm install`. This will install the necessary software components.
- Browser Functions uses sub-domains to separate applications from each other, so for local development, you will need to add the domain names into your `/etc/hosts` file pointing to localhost (see below for using dnsmasq instead). Start with the following:

```
127.0.0.1 browserfunctions.test 
127.0.0.1 examples.browserfunctions.test
127.0.0.1 myapp.browserfunctions.test
```
- Set the admin access key in the `MASTER_ACCESS_KEY` OS environment variable, example: `export MASTER_ACCESS_KEY=mysupersecretadminpassword`
- To start the server, run `npm start`. By default, the server will automatically spin up a Chrome instance for local development.

You can now create an app within Browser Functions called `myapp` and access it. Any new apps you create will need a corresponding DNS entry. For a hosted server, you should register a wildcard DNS entry for your server domain pointing to the server.

## Admin page

You can access the admin page to control the browser instances: `https://yourserver.com/admin?access-key=xxxx-xxxx-xxxx-xxx-xxx` where the admin key is specified in the `MASTER_ACCESS_KEY` OS environment variable.

## Using dnsmasq instead of /etc/hosts

Instead of adding each application manually to your local `/etc/hosts` file, you can instead run a local DNS server to handle this.

Set up dnsmasq to point all *.test urls to 127.0.0.1 using this method:
https://medium.com/@kharysharpe/automatic-local-domains-setting-up-dnsmasq-for-macos-high-sierra-using-homebrew-caf767157e43

This should not be needed on production machines that have a publicly available domain name, provided the domain supports wildcard subdomains.

## Deployment and Provisioning

Default configuration can be found in `server/config.js`

[forever](https://github.com/foreversd/forever) can be used to keep the application running in production mode. The app can be started
and stopped with `NODE_ENV=production forever start -a -l /var/log/browser_functions/app.log server/server.js` and `forever stop 0`

The app can be run without forever or with another tool such as systemd, however when running a production instance you must ensure that the `NODE_ENV` environment
variable is set to `production`.

### Host
When running in production there must be an environment variable called `HOST` which should be the domain name that has been registered 
for your server eg. browserfunctions.test

### Master access key
When running in production there must be an environment variable called `MASTER_ACCESS_KEY`. This is used for accessing the admin console
and for master controllers to connect to the server. In development this defaults to the string `MASTER_ACCESS_KEY`

### Logging
By default the app will log to `/var/log/browser_functions/app.log`. Ensure the user running the process has write permissions
or alternatively edit this location in the package.json.

### Functions root
Controlled by the `FUNCTIONS_ROOT` environment variable. This defaults to the functions_root folder inside this repo.
This is the location that applications and functions will be read and written to. The user running the process must have write access to this directory. 

### Ubuntu Server
The following packages are required if deploying to Ubuntu server. They needed to run chromium/firefox in headless mode:
- gconf-service
- libasound2
- libatk1.0-0
- libatk-bridge2.0-0
- libc6
- libcairo2
- libcups2
- libdbus-1-3
- libexpat1
- libfontconfig1
- libgcc1
- libgconf-2-4
- libgdk-pixbuf2.0-0
- libglib2.0-0
- libgtk-3-0
- libnspr4
- libpango-1.0-0
- libpangocairo-1.0-0
- libstdc++6
- libx11-6
- libx11-xcb1
- libxcb1
- libxcomposite1
- libxcursor1
- libxdamage1
- libxext6
- libxfixes3
- libxi6
- libxrandr2
- libxrender1
- libxss1
- libxtst6
- ca-certificates
- fonts-liberation
- libappindicator1
- libnss3
- lsb-release
- xdg-utils
- wget
