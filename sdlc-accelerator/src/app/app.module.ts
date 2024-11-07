import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { AppRoutingModule, routes } from "./app.routes";
import { SingleWorkflowComponent } from './singleworkflow/singleworkflow.component';
import { ButtonModule, FileUploaderModule } from 'carbon-components-angular';





import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { GridModule, IconModule, ProgressIndicatorModule, ThemeModule, UIShellModule } from 'carbon-components-angular';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { PlanningComponent } from './planning/planning.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({

    declarations: [
      AppComponent,
     HeaderComponent, 
     FooterComponent, 
     PlanningComponent,
    SingleWorkflowComponent
    ],
    imports: [
      BrowserModule,
      BrowserAnimationsModule,
      HttpClientModule,
      CommonModule,  
      ThemeModule,
      UIShellModule, 
      UIShellModule, 
      ThemeModule, 
      IconModule,
      GridModule, 
      ProgressIndicatorModule,
      FontAwesomeModule, 
      FileUploaderModule,
  
    ],
    providers: [],
	  bootstrap: [AppComponent]
  
  })
  export class AppModule {}

