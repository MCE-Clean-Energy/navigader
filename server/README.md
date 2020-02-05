## NavigaDER Server

The NavigaDER server functions primarily as a proxy server for the BEO datastore. Its two main
functions are:
 - To serve the static front-end assets
 - To proxy requests to the BEO REST API endpoints
 
### Setting up

Installing dependencies:

```bash
npm install
```

A couple of environment variables are necessary to configure the URI of the BEO server. Create
a `.env` file:

```
PROXY_HOST=<BEO server host>
PROXY_PORT=<BEO server port>
```

The application is now ready to run:

```bash
npm run dev
```

### Usage

By default, the application will serve on port 3000, so navigating in your browser to
`http://localhost:3000/` will take you to the NavigaDER home page.

### All environment variables

Environment variables can be configured in the `.env` file, which you must first create:
 - __PROXY_HOST__: The host domain of the back-end BEO server. For instance, if the BEO server is
  running on `localhost:8000`, the variable should be set to _localhost_
 - __PROXY_port__: The port on which the back-end BEO server is running. For instance, if the BEO
  server is running on `localhost:8000`, the variable should be set to _8000_
 - __PORT__ *[default 3000]*: The port on which the express server should run
