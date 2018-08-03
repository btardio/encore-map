import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

import { LeafletDemoModule } from './leaflet/leaflet-demo.module';

import { HttpClientModule } from '@angular/common/http';

@NgModule({
	imports: [
		BrowserModule,
		LeafletDemoModule,
    HttpClientModule,
    
	],
	declarations: [
		AppComponent,
    //MyCustomDirective
	],
  exports: [
    //MyCustomDirective
  ],
  
	bootstrap: [ AppComponent ],
	providers: [ ]//MyCustomDirective ]
})
export class AppModule { }
