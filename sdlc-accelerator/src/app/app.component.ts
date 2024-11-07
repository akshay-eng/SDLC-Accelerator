import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { PlanningComponent } from './planning/planning.component';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './footer/footer.component';
import { ThemeModule } from 'carbon-components-angular';
import { CheckboxModule, ButtonModule } from 'carbon-components-angular';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule,
    CheckboxModule, 
    ButtonModule,
            RouterOutlet, 
            RouterLink, 
            RouterLinkActive,
            ThemeModule, 
            HeaderComponent, 
            FooterComponent, 
            PlanningComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'sdlcaccl';
}
