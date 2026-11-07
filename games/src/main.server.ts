import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { serverConfig } from './app/app.config.server';

/** Entry used at build time to prerender every page to static HTML */
const bootstrap = (context: BootstrapContext) => bootstrapApplication(App, serverConfig, context);

export default bootstrap;
