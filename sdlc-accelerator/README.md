# README

## Title
SDLC Accelerator

## Description
This asset demonstrates watsonx.ai capabilities to reverse engineer legacy code, generate requirement documents, low-level design documents, architecture, application code and DevOps pipelines to deploy applications into cloud native infrastructure such as Red Hat OpenShift. This significantly boosts productivity across DevOps and SRE teams.

## Deployment Steps

This project has dependency on below two services (three endpoints) and jenkins credentials. First deploy these services and get their endpoints:
### i) watsonx_proxy service: 
Follow the Readme instructions to deploy watsonx_proxy service
https://ibm.box.com/s/vqqcfn4n7tsvwxojv8bz8zcr6e6fqyvx
### ii) extracttext service & generate diagram service: 

Follow the Readme instructions to deploy extracttext service
Two endpoints, '/extracttext' and '/generateDiagram' are served by this service

https://ibm.box.com/s/n2847xbt4ax5yns3jkznfmhk4d79fv5y

After completing the deployment of above two services, follow the below instructions to build and deploy SDLC accelerator.

### iii) createitem service using jenkins:

Need to have a jenkins server running and access required access to create a job. provide the jenkins credentials while deploying the sdlc accelerator as env for container in cloud or openshift.
ENV Variables example:
```
JENKINS_USR="user"
JENKINS_PWD="jenkins-api-token"
```

## Building Docker Image
Building the docker image requires three build arguments to be passed in:
### i) WATSONX_PROXY: 
Endpoint of the service deployed from https://ibm.box.com/s/vqqcfn4n7tsvwxojv8bz8zcr6e6fqyvx
### ii) EXTRACTTEXT_PROXY: 
'extracttext' endpoint of the service deployed from https://ibm.box.com/s/n2847xbt4ax5yns3jkznfmhk4d79fv5y
### iii) GENERATEDIAGRAM_PROXY: 
'generateDiagram' endpoint of the service deployed from https://ibm.box.com/s/n2847xbt4ax5yns3jkznfmhk4d79fv5y
### iv) CREATEITEM_PROXY: 
Endpoint of the jenkins server


Run below command to build the docker image.

`docker build -t sdlc_dsce:latest --build-arg WATSONX_PROXY=<watsonx proxy service> --build-arg EXTRACTTEXT_PROXY=<extracttest service> --build-arg GENERATEDIAGRAM_PROXY=<generate diagram service> --build-arg CREATEITEM_PROXY=<jenkins server> -f devops/Dockerfile .`

### Example:
`docker build -t sdlc_dsce:latest --build-arg WATSONX_PROXY=https://watsonx-proxy.1ehsyhj7yesr.us-east.codeengine.appdomain.cloud/watsonx_proxy --build-arg EXTRACTTEXT_PROXY=https://extracttext.1es0et4q3hcc.us-east.codeengine.appdomain.cloud/extracttext --build-arg GENERATEDIAGRAM_PROXY=https://extracttext.1es0hrxs3hcc.us-east.codeengine.appdomain.cloud/generateDiagram --build-arg CREATEITEM_PROXY=https://127.0.0.1:8443 -f devops/Dockerfile .`


## Local Development Setup

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.2.1.

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.