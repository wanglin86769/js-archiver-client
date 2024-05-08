# A JavaScript Client for Archiver Appliance

**js-archiver-client** is a JavaScript client for Archiver Appliance, and it aims to provide some batch operations which are useful but currently not officially provided by Archiver Appliance.

![Alt text](webclient/docs/screenshots/home_page.png?raw=true "Title")

## Use cases

This tool can be used for the following batch operations which is currently not supported by Archiver Appliance,

* Batch operation for PV update
* Batch operation for PV rename
* Batch operation for PV delete but keep the data

The following additional functions are also provided,

* List PVs that are being archived in Archiver Appliance
* Export PVs that are being archived in Archiver Appliance to Microsoft Excel file

## Architecture

Due to the CORS (Cross-Origin Resource Sharing) restriction of web browsers, JavaScript code running inside web browsers cannot directly access the REST API in Archiver Appliance. Therefore, it is necessary to deploy a proxy in between the web client and Archiver Appliance.

![Alt text](webclient/docs/screenshots/architecture.png?raw=true "Title")

## Environment

The following frameworks and libraries are used,

* PrimeVue component library
* Vue.js framework
* Node.js runtime

A recent Node.js version is required and the following version has been tested,

* Node.js 20.12.2

## Configuration

Prior to development or deployment, some parameters need to be configured.

The proxy URL can be configured in `proxyPath` attribute of the following file,
```
./webclient/src/config/configuration
```

The Archiver Appliance URL can be configured in `archiver_bpl_url` attribute of the following file,
```
./proxy/config.js
```

The web UI base path can be configured in `base` attribute of the following file,
```
./webclient/vite.config.js
```

## Development

Go to webclient directory
```
cd webclient
npm install
npm run dev
```

Go to proxy directory
```
cd proxy
npm install
npm run dev
```

## Deployment with Apache http server and Node.js

Go to webclient directory
```
cd webclient
npm ci
npm run build
cp -r dist/* /var/www/html
```

Go to proxy directory
```
npm install pm2 -g
cd proxy
npm ci
pm2 start server.js
```

## Deployment with Docker

One compose.yaml and two Dockerfiles (one for webclient and one for proxy) are provided to create the following two containers,

* webclient: Vue.js web pages
* proxy: Node.js proxy

Prior to building images and running containers, the values of `proxyPath` in `webclient/src/config/configuration` and `archiver_bpl_url` in `proxy/config.js` need to be configured.

The following commands can be used to build images and run containers,

```
docker compose build --no-cache
docker compose up
```

If building and running succeed, the following page can be accessed,

```
http://ip_address:8080/
```

Docker deployment has been tested in the following environment,

* Debian 10 Linux
* Docker version 26.1.0

## Usage

The `Home` page can be used to check PV status, archive PVs, update PVs, rename PVs, delete PVs, pause PVs and resume PVs.

For PV update operation, actually PVs are first deleted and then added again.

For PV rename operation, pv/newname pairs need to be inputted line by line, and pv and newname need to be separated by space or comma.

The `PV List` page can be used to list all PV names that are being archived in the Archiver Appliance.

The `PV Info` page can be used to list all PV names that are being archived in the Archiver Appliance as well as archiving parameters.

## Screenshots

Archival parameters dialog

![Alt text](webclient/docs/screenshots/archival_parameters_dialog.png?raw=true "Title")

PV list page

![Alt text](webclient/docs/screenshots/pv_list_page.png?raw=true "Title")

PV info page

![Alt text](webclient/docs/screenshots/pv_info_page.png?raw=true "Title")

## License
MIT license