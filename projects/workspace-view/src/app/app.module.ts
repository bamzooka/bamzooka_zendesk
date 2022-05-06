import {Injector, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {createCustomElement} from "@angular/elements";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {McSpinnerModule} from "@bamzooka/ui-kit-spinner";
import {NgbDropdownModule, NgbTooltipModule} from "@ng-bootstrap/ng-bootstrap";
import {
  McIconModule, QuestionCircle, ThreeDotsVertical,
  BoxArrowRight,
  Unlock, BoxArrowUpRight
} from "@bamzooka/ui-kit-icon";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    McSpinnerModule,
    NgbDropdownModule,
    NgbTooltipModule,
    McIconModule.pick({
      QuestionCircle,
      ThreeDotsVertical,
      Unlock,
      BoxArrowUpRight,
      BoxArrowRight
    })
  ],
  providers: [],
})
export class AppModule {
  constructor(injector: Injector) {
    const element = createCustomElement(AppComponent, {injector});
    customElements.define('bamzooka-zendesk-workspace-view', element);
  }

  ngDoBootstrap() {
  }
}
