import { Component ,HostBinding, Input} from '@angular/core';
import { Router } from '@angular/router';

import { IconService } from "carbon-components-angular";
import { UIShellModule, IconModule,GridModule } from 'carbon-components-angular';
import { ThemeModule } from 'carbon-components-angular';

import Notification20 from '@carbon/icons/es/notification/20';
import UserAvatar20 from '@carbon/icons/es/user--avatar/20';
import Settings20 from '@carbon/icons/es/settings/20';
import IBMWatsonMachineLearning20 from '@carbon/icons/es/ibm-watson--machine-learning/20';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Template32 from '@carbon/icons/es/template/32';
import Screen32 from '@carbon/icons/es/screen/32';
import CodeAssisant32 from '@carbon/icons/es/ibm-watsonx--code-assistant-for-z--refactor/32'
import RequestQuote32 from '@carbon/icons/es/request-quote/32'
import DeploymentPolicy32 from '@carbon/icons/es/deployment-policy/32';
import LicenseMaintenance32 from '@carbon/icons/es/license--maintenance/32';
import  IbmWatsonxCodeAssistant32 from '@carbon/icons/es/ibm-watsonx--code-assistant/32'


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [UIShellModule, UIShellModule, ThemeModule, IconModule, GridModule, FormsModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})


export class HeaderComponent {
  @HostBinding('class.cds--header') headerClass = true;

  @Input() activeLinkClass: string | string[] | undefined;
  @Input() currentPage: string = "";
  @Input() active: boolean=false;
  
  constructor(protected iconService: IconService, private router: Router) {
    iconService.registerAll([
			Notification20,
			UserAvatar20,
      Settings20,
      IBMWatsonMachineLearning20,
      Template32, Screen32, CodeAssisant32, RequestQuote32, DeploymentPolicy32, LicenseMaintenance32, IbmWatsonxCodeAssistant32
		]);
  }

  changeRoute(evt: MouseEvent, name: string) {
    const pages = {
      'home': 'home',
      'app-root': 'App Root',
      'reverse_eng' : 'Reverse Engineering',
      'planning': 'Requirements Gathering',
      'design': 'Design',
      'development' : 'Development',
      'testing': 'Testing',
      'deployment': 'Deployment',
      'operations': 'https://kube-assistant.1c3199rouftg.us-east.codeengine.appdomain.cloud/'
    }
    evt.preventDefault();

    //let navcfg = [{ outlets: { secondary: name } }];
    if(name === 'operations'){
      window.open(pages[name], "_blank");
    } else {
    this.currentPage = name in pages ? pages[name as keyof typeof pages] : ""
    this.router.navigate([name], {
      skipLocationChange: true,
    });
    }
  }

}
