import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app-module';

//ng generate c NAME --style=scss --v=none --type=component
//ng generate s name --type=service

platformBrowser().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true,
})
  .catch(err => console.error(err));
