import { Component } from '@angular/core';

@Component({
  selector: 'app-component',
  templateUrl: './app.component.html'
})
export class AppComponent {
  notificationOptions = { position: ['top','center'],
                          animate: 'fromTop' };
}
