import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTwitter, faFacebook, faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';


@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  
    faTwitter=faTwitter;
    faFacebook=faFacebook;
    faGithub=faGithub;
    faLinkedin=faLinkedin;
}
