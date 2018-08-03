import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LeafletModule } from '../../leaflet.module';

import { LeafletEncoreLeafletComponent } from './encoreLeaflet/encoreLeaflet.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    LeafletModule.forRoot()
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
 