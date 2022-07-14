import { Component } from '@angular/core';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  sub

  constructor(public ns: NotificationService) {
  }

  async onClick() {
    this.sub = await this.ns.requestPermission()
  }
}
