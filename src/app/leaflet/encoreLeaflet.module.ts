import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LeafletModule } from '../../leaflet.module';

import { LeafletEncoreLeafletComponent } from './encoreLeaflet/encoreLeaflet.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClrFormsNextModule } from '@clr/angular';





@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    LeafletModule.forRoot(),
    ClrFormsNextModule,
  ],
  declarations: [
    LeafletEncoreLeafletComponent,
  ],
  exports: [
    LeafletEncoreLeafletComponent,
  ],
  bootstrap: [ LeafletEncoreLeafletComponent ],
  providers: [ ]
})
export class EncoreLeafletModule { }
 