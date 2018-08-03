import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

import { EncoreLeafletModule } from './leaflet/encoreLeaflet.module';

import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    BrowserModule,
    EncoreLeafletModule,
    HttpClientModule,
  ],
  declarations: [
    AppComponent,
],
  exports: [
  ],

  bootstrap: [ AppComponent ],
  providers: [ ]
})
export class AppModule { }
