import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

import { EncoreLeafletModule } from './leaflet/encoreLeaflet.module';

import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule, ClrFormsNextModule } from '@clr/angular';

import { SimpleNotificationsModule } from 'angular2-notifications';

@NgModule({
  imports: [
    BrowserModule,
    EncoreLeafletModule,
    HttpClientModule,
    ClarityModule,
    ClrFormsNextModule,
    BrowserAnimationsModule,
    SimpleNotificationsModule.forRoot()
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
