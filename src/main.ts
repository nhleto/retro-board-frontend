import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { routes } from './routes';
import { AppComponent } from './app/app.component';
import { RouterModule } from '@angular/router';


bootstrapApplication(AppComponent, {
  providers: [importProvidersFrom(RouterModule.forRoot(routes))]
}).catch(err => console.error(err));
