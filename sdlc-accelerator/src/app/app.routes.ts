import { RouterModule, Routes } from '@angular/router';
import { PlanningComponent } from './planning/planning.component';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DesignComponent } from './design/design.component';
import { DevelopmentComponent } from './development/development.component';
import { TestingComponent } from './testing/testing.component';
import { DeploymentComponent } from './deployment/deployment.component';
import { REngineeringComponent } from './rengineering/rengineering.component';
import { SingleWorkflowComponent } from './singleworkflow/singleworkflow.component';


export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'app-root', component: AppComponent },
    { path: 'reverse_eng', component: REngineeringComponent},
    { path: 'planning', component: PlanningComponent},
    { path: 'design', component: DesignComponent },
    { path: 'development', component: DevelopmentComponent },
    { path: 'testing', component: TestingComponent },
    { path: 'deployment', component: DeploymentComponent },
    { path: 'SingleWorkflow', component: SingleWorkflowComponent },
 
];

@NgModule({
    declarations: [],
    imports: [
      CommonModule
    ],
    exports : [RouterModule]
  })

export class AppRoutingModule { }
