import cookieParser from 'cookie-parser';
import express, { Express } from 'express';
import proxy from 'express-http-proxy';
import createError from 'http-errors';
import logger from 'morgan';
import * as path from 'path';

import * as routers from './routers';


export default class Server {
  private app: Express;
  
  private readonly SERVER_START_MSG = 'Server started on port: ';

  constructor (app: Express) {
    this.app = app;
    
    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    
    // In production mode, the server serves the front-end. In development mode that's handled
    // by webpack
    if (process.env.NODE_ENV === 'production') {
      this.serveFrontEnd();
    }
    
    this.setupProxyRoutes();
    this.setupErrorHandling();
  }
  
  private setupProxyRoutes () {
    const proxyUri = [process.env.PROXY_HOST, process.env.PROXY_PORT].join(':');
    console.info(`Using proxy URI: ${proxyUri}`);
    this.app.use('/beo', proxy(proxyUri));
    this.app.use('/login', routers.login(proxyUri));
  }
  
  private setupErrorHandling () {
    // catch 404 and forward to error handler
    this.app.use(function (req, res, next) {
      next(createError(404));
    });
  }
  
  private serveFrontEnd () {
    const dir = path.join(__dirname, 'build/frontend/');

    // Set the static and views directory
    this.app.use(express.static(dir));
    
    // Serve front-end content
    this.app.get('*', (req, res) => {
        res.sendFile('build/frontend/index.html', { root: dir });
    });
  }

  public start(port: number): void {
    this.app.listen(port, () => {
      console.log(this.SERVER_START_MSG + port);
    });
  }
}
