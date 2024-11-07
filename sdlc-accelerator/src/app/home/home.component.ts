import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  GridModule,
  IconModule,
  IconService,
  ThemeModule,
  TilesModule,
  UIShellModule

} from 'carbon-components-angular';

import Template32 from '@carbon/icons/es/template/32';
import Screen32 from '@carbon/icons/es/screen/32';
import CodeAssisant32 from '@carbon/icons/es/ibm-watsonx--code-assistant-for-z--refactor/32'
import RequestQuote32 from '@carbon/icons/es/request-quote/32'
import DeploymentPolicy32 from '@carbon/icons/es/deployment-policy/32';
import LicenseMaintenance32 from '@carbon/icons/es/license--maintenance/32';
import ArrowRight24 from '@carbon/icons/es/arrow--right/24';
import  IbmWatsonxCodeAssistant32 from '@carbon/icons/es/ibm-watsonx--code-assistant/32'

import { Router } from '@angular/router';

@Component({
  selector: 'home',
  standalone: true,
  imports: [IconModule, ThemeModule, UIShellModule, GridModule, TilesModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  condensed = false;
  narrow = true;
  fullWidth = true;
  disabled: boolean = false;
  href: string="";
  constructor(protected iconService: IconService, private router: Router) {
		iconService.registerAll([
			Template32,
      Screen32,
      CodeAssisant32,
      RequestQuote32,
      DeploymentPolicy32,
      LicenseMaintenance32,
      ArrowRight24,
      IbmWatsonxCodeAssistant32
		]);
	}

  changeRoute(evt: MouseEvent, name: string) {
    const pages = {
      'home': 'home',
      'app-root': 'App Root',
      'planning': 'Requirement Gathering',
      'design': 'Design',
      'development' : 'Development',
      'testing': 'Testing',
      'deployment': 'Deployment',
    }
    evt.preventDefault();

    this.router.navigate([name], {
      skipLocationChange: true,
    });
  }
}
