import {Injector, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {createCustomElement} from "@angular/elements";
import {ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {McSpinnerModule} from "@bamzooka/ui-kit-spinner";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    McSpinnerModule
  ],
  providers: [],
})
export class AppModule {
  constructor(injector: Injector){
    const element = createCustomElement(AppComponent, {injector});
    customElements.define('bamzooka-zendesk-workspace-view', element);
  }
  ngDoBootstrap() {}
}
