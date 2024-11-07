import { CommonModule } from '@angular/common';
import { AfterContentInit, Component , Inject, Input} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TabsModule, GridModule, LayoutModule, InputModule, ButtonModule, LoadingModule, IconModule, CodeSnippetModule, IconService, SnippetType, ModalModule, PlaceholderModule, ModalService, BaseModalService, NotificationModule, Toast} from 'carbon-components-angular';
import { APIServiceService } from '../service/apiservice.service';
import Download20 from '@carbon/icons/es/download/20';
import { TitleComponent } from '../title/title.component';
import {
  NuMonacoEditorComponent,
  NuMonacoEditorModel,
} from '@ng-util/monaco-editor';
import { ModalComponent } from '../modal/modal.component';
import { Observable, Subject } from 'rxjs';


@Component({
  selector: 'deployment',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TabsModule, 
    GridModule, 
    LayoutModule,
    InputModule,
    ButtonModule,
    LoadingModule,
    IconModule,
    CodeSnippetModule,
    TitleComponent,
    NuMonacoEditorComponent,
    ModalModule,
    PlaceholderModule,
    NotificationModule,
],
  templateUrl: './deployment.component.html',
  styleUrl: './deployment.component.scss'
})
export class DeploymentComponent implements AfterContentInit {
  projectId: string = "ebc65ffd-b66f-4c10-b901-894ce0c61053";
  gap = 1;
  options = { theme: 'vs' };
  protected modalInputValue = "";
	protected data: Observable<string> = new Subject<string>();
  openModal() {
    this.modalService.create({component: ModalComponent, inputs: {
      inputValue: this.modalInputValue,
			data: this.data
    }});
    }

  xmlText = "" 
  model:NuMonacoEditorModel = {
    value: "",
    language: 'xml',
  };
  invalid: boolean = false;
  invalidText: string = "";
  warn: boolean = false;
  disabled: boolean = false;
  theme: any = "dark";
  size: any = "lg";

  isActive = false;
  normal = "normal";
  overlay = true;
  loadingVisible = false;

  activeTab= 0
  showNextStage = false

  jenkinsGenInstInvalid: boolean = false;
  jenkinsGenInstInvalidText: string = "";
  dockerGenInstInvalid: boolean = false;
  dockerGenInstInvalidText: string = "";
  ocpConfigGenInstInvalid: boolean = false;
  ocpConfigGenInstInvalidText: string = "";

  jenkinsConfigJobInputInvalid: boolean = false;
  jenkinsConfigJobInputInvalidText: string = "";
  jenkinsGenInputInvalid: boolean = false;
  jenkinsGenInputInvalidText: string = "";
  dockerGenInputInvalid: boolean = false;
  dockerGenInputInvalidText: string = "";
  ocpConfigGenInputInvalid: boolean = false;
  ocpConfigGenInputInvalidText: string = "";


  jenkinsConfigJobExample:string = "Input: Generate Jenkins job configuration file for the project test-project with GitHub URL https://github.ibm.com/automation-squad/test-project.git and imagename as test-project\nOutput: <?xml version='1.1' encoding='UTF-8'?>\n<flow-definition plugin=\"workflow-job@1400.v7fd111b_ec82f\">\n  <actions/>\n  <description></description>\n  <keepDependencies>false</keepDependencies>\n  <properties>\n    <hudson.model.ParametersDefinitionProperty>\n      <parameterDefinitions>\n        <hudson.model.StringParameterDefinition>\n          <name>container_registry_url</name>\n          <defaultValue>quay.io</defaultValue>\n          <trim>false</trim>\n        </hudson.model.StringParameterDefinition>\n        <hudson.model.StringParameterDefinition>\n          <name>registry_namespace</name>\n          <defaultValue>eesilab</defaultValue>\n          <trim>false</trim>\n        </hudson.model.StringParameterDefinition>\n        <hudson.model.StringParameterDefinition>\n          <name>imagename</name>\n          <defaultValue>test-project</defaultValue>\n          <trim>false</trim>\n        </hudson.model.StringParameterDefinition>\n        <hudson.model.PasswordParameterDefinition>\n          <name>IBM_CLOUD_API_KEY</name>\n          <defaultValue>ibm_cloud_api_key_value</defaultValue>\n        </hudson.model.PasswordParameterDefinition>\n        <hudson.model.StringParameterDefinition>\n          <name>OCP_API_URL</name>\n          <defaultValue>ocp_api_url_value</defaultValue>\n          <trim>false</trim>\n        </hudson.model.StringParameterDefinition>\n        <hudson.model.StringParameterDefinition>\n          <name>Namespace</name>\n          <defaultValue>demo</defaultValue>\n          <trim>false</trim>\n        </hudson.model.StringParameterDefinition>\n      </parameterDefinitions>\n    </hudson.model.ParametersDefinitionProperty>\n  </properties>\n  <definition class=\"org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition\" plugin=\"workflow-cps@3883.vb_3ff2a_e3eea_f\">\n    <scm class=\"hudson.plugins.git.GitSCM\" plugin=\"git@5.2.1\">\n      <configVersion>2</configVersion>\n      <userRemoteConfigs>\n        <hudson.plugins.git.UserRemoteConfig>\n          <url>https://github.ibm.com/automation-squad/test-project.git</url>\n          <credentialsId>github.ibm.com</credentialsId>\n        </hudson.plugins.git.UserRemoteConfig>\n      </userRemoteConfigs>\n      <branches>\n        <hudson.plugins.git.BranchSpec>\n          <name>*/main</name>\n        </hudson.plugins.git.BranchSpec>\n      </branches>\n      <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>\n      <submoduleCfg class=\"empty-list\"/>\n      <extensions/>\n    </scm>\n    <scriptPath>devops/jenkinsfile</scriptPath>\n    <lightweight>true</lightweight>\n  </definition>\n  <triggers/>\n  <disabled>false</disabled>\n</flow-definition>";
  placeholderJenkinsConfigJobInput: string = "Generate Jenkins file for given input.\n\nInput: Create Jenkins file to build watsonx-prompter application'\''s docker image using docker file in the path devops/Dockerfile. The application has to be deployed in OpenShift cluster on IBM Cloud. The application code is in the GitHub repository https://github.ibm.com/automation-squad/watsonx-prompter.git. Use github.ibm.com as credentialsId.\nOutput: timestamps {\n    node () {\n        wrap([$class: '\''Xvfb'\'']) {\n            stage ('\''watsonx-prompter - Checkout'\'') {\n                checkout([$class: '\''GitSCM'\'', branches: [[name: '\''*/main'\'']], doGenerateSubmoduleConfigurations: false, extensions: [], submoduleCfg: [], userRemoteConfigs: [[credentialsId: '\''github.ibm.com'\'', url: '\''https://github.ibm.com/automation-squad/watsonx-prompter.git'\'']]])\n            }\n            stage ('\''watsonx-prompter - Build & Deployment'\'') {\n\n                sh \"docker login ${container_registry_url}\"\n                sh \"docker build -t ${imagename}:${BUILD_NUMBER} -f devops/Dockerfile .\"\n                sh \"docker tag ${imagename}:${BUILD_NUMBER} ${container_registry_url}/${registry_namespace}/${imagename}:${BUILD_NUMBER}\"\n                sh \"docker tag ${imagename}:${BUILD_NUMBER} ${container_registry_url}/${registry_namespace}/${imagename}:latest\"\n                sh \"docker push ${container_registry_url}/${registry_namespace}/${imagename}:${BUILD_NUMBER}\"\n                sh \"docker push ${container_registry_url}/${registry_namespace}/${imagename}:latest\"\n\n                // Deploy application\n                sh \"ibmcloud login --apikey ${IBM_CLOUD_API_KEY} -r '\''us-south'\'' -g Default\"\n                sh \"oc login ${OCP_API_URL} -u apikey -p ${IBM_CLOUD_API_KEY}\"\n\n                sh \"oc project ${Namespace}\"\n                sh \"oc apply -f devops/\"\n                sh \"oc get route -n ${Namespace}\"\n\n            }\n        }\n        cleanWs()\n    }\n}\n\nInput: Create Jenkins file to build  fav-movies-final application'\''s docker image using docker file in the path devops/Dockerfile. The application has to be deployed in OpenShift cluster on IBM Cloud. The application code is in the GitHub repository https://github.ibm.com/automation-squad/fav-movies-final.git. Use github.ibm.com as credentialsId."
  placeholderJenkinsGenInst: any = "Generate Jenkins file for given input.\n\nInput: Create Jenkins file to build watsonx-prompter application'\''s docker image using docker file in the path devops/Dockerfile. The application has to be deployed in OpenShift cluster on IBM Cloud. The application code is in the GitHub repository https://github.ibm.com/automation-squad/watsonx-prompter.git. Use github.ibm.com as credentialsId.\nOutput: timestamps {\n    node () {\n        wrap([$class: '\''Xvfb'\'']) {\n            stage ('\''watsonx-prompter - Checkout'\'') {\n                checkout([$class: '\''GitSCM'\'', branches: [[name: '\''*/main'\'']], doGenerateSubmoduleConfigurations: false, extensions: [], submoduleCfg: [], userRemoteConfigs: [[credentialsId: '\''github.ibm.com'\'', url: '\''https://github.ibm.com/automation-squad/watsonx-prompter.git'\'']]])\n            }\n            stage ('\''watsonx-prompter - Build & Deployment'\'') {\n\n                sh \"docker login ${container_registry_url}\"\n                sh \"docker build -t ${imagename}:${BUILD_NUMBER} -f devops/Dockerfile .\"\n                sh \"docker tag ${imagename}:${BUILD_NUMBER} ${container_registry_url}/${registry_namespace}/${imagename}:${BUILD_NUMBER}\"\n                sh \"docker tag ${imagename}:${BUILD_NUMBER} ${container_registry_url}/${registry_namespace}/${imagename}:latest\"\n                sh \"docker push ${container_registry_url}/${registry_namespace}/${imagename}:${BUILD_NUMBER}\"\n                sh \"docker push ${container_registry_url}/${registry_namespace}/${imagename}:latest\"\n\n                // Deploy application\n                sh \"ibmcloud login --apikey ${IBM_CLOUD_API_KEY} -r '\''us-south'\'' -g Default\"\n                sh \"oc login ${OCP_API_URL} -u apikey -p ${IBM_CLOUD_API_KEY}\"\n\n                sh \"oc project ${Namespace}\"\n                sh \"oc apply -f devops/\"\n                sh \"oc get route -n ${Namespace}\"\n\n            }\n        }\n        cleanWs()\n    }\n}";
  placeholderJenkinsGenInput: any = "Create Jenkins file to build  fav-movies application's docker image using docker file in the path devops/Dockerfile. The application has to be deployed in OpenShift cluster on IBM Cloud.. The application code is in the GitHub repository https://github.ibm.com/automation-squad/fav-movies.git. Use github.ibm.com as credentialsId.";
  placeholderDockerGenInst: any = "Generate a docker file for running a python application watsonx-prompter.py on port 8080 which uses following environment variables: PROJECT_ID, API_KEY and WATSONX_URL. The application should run as a non-root user, namely favuser.\nOutput: FROM python:3.11-slim\nLABEL maintainer=\"EESI Lab - Automation Squad\"\nRUN groupadd -r favuser && useradd -r -g favuser favuser\nENV PROJECT_ID=\"\" \\\n    API_KEY=\"\" \\\n    WATSONX_URL=\"\"\n\nRUN mkdir app\nWORKDIR /app\n\n# Copy requirements.txt and install dependencies\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\n# Copy the application files\nCOPY . .\n\n# Set ownership of the application directory to the non-root user\nRUN chmod -R 777 .\nRUN chown -R favuser:favuser .\n\n# Switch to the non-root user\nUSER favuser\n\nEXPOSE 8080\n\nCMD [\"python\", \"watsonx-prompter.py\"]";
  placeholderDockerGenInput: any = "Generate a docker file for running a python application main.py on port 5000 which uses following environment variables: API_KEY. The application should run as a non-root user, namely favuser."
  placeholderOCPConfigGenInst: any = " Create yaml files to deploy the watsonx-prompter application on OpenShift in demo namespace and expose the route with TLS termination at edge. The application container image is available at quay.io/eesilab/watsonx-prompter:latest with container port as 8080. It accepts following environment variables: PROJECT_ID, API_KEY and WATSONX_URL.\nOutput: apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: watsonx-prompter-deployment\n  namespace: demo\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: watsonx-prompter\n  template:\n    metadata:\n      labels:\n        app: watsonx-prompter\n    spec:\n      containers:\n      - name: watsonx-prompter-container\n        image: quay.io/eesilab/watsonx-prompter:latest\n        imagePullPolicy: Always\n        ports:\n        - containerPort: 8080\n        env:\n          - name: PROJECT_ID\n            value: \"ebc65ffd-b66f-4c10-b901-894ce0c61053\"\n          - name: API_KEY\n            value: \"efDjoR-XVp1Ji-O7lRMUapTpzTVRmYyElf_gL1aK4m6_\"\n          - name: WATSONX_URL\n            value: \"https://us-south.ml.cloud.ibm.com/ml/v1-beta/generation/text?version=2023-05-29\"\n        securityContext:\n          allowPrivilegeEscalation: false\n          runAsNonRoot: true\n          seccompProfile:\n            type: RuntimeDefault\n          capabilities:\n            drop:\n              - ALL\n\n---\napiVersion: v1\nkind: Service\nmetadata:\n  name: watsonx-prompter-svc\n  namespace: demo\nspec:\n  ports:\n  - port: 8080\n    protocol: TCP\n    targetPort: 8080\n  selector:\n    app: watsonx-prompter\n  type: ClusterIP\n\n---\napiVersion: route.openshift.io/v1\nkind: Route\nmetadata:\n  name: watsonx-prompter-route\n  namespace: demo\nspec:\n  port:\n    targetPort: 8080\n  tls:\n    insecureEdgeTerminationPolicy: Allow\n    termination: edge\n  to:\n    kind: Service\n    name: watsonx-prompter-svc\n    weight: 100\n  wildcardPolicy: None";
  placeholderOCPConfigGenInput: any = "Create yaml files to deploy the fav-movies application on OpenShift in demo namespace and expose the route with TLS termination at edge. The application container image is available at quay.io/eesilab/fav_movies:latest with container port as 8080. It accepts following environment variables: API_KEY with value <api_key_value>."
  
  generateJenkinsConfigJobResultVisible= false;
  generateJenkinsResultsVisible = false;
  generateDockerResultsVisible = false;
  generateOCPConfigResultsVisible = false;

  jenkinsConfigJobForm!: FormGroup;
  jenkinsGenForm!: FormGroup;
  dockerGenForm!: FormGroup;
  ocpConfigGenForm!: FormGroup;

  generateJenkinsJobConfig_respone = new FormControl('')
  generateJenkins_response = new FormControl('');
  generateDocker_response = new FormControl('');
  generateOCPConfig_response = new FormControl('');

  original_repsone!: string;
  displayData!: string;

  multi: any;

  notificationObj = {
    type: 'success' as any,
    title: 'Sample toast',
    subtitle: 'Sample subtitle message',
    caption: 'Sample caption',
    showClose: true
  }

  notificationShow = false;
  constructor(private service: APIServiceService,
   protected modalService: ModalService,
    protected iconService: IconService) {
    iconService.registerAll([
      Download20
    ]);
  }
  ngAfterContentInit() {
		this.data.subscribe(value => {
      this.modalInputValue = value
      if(value)
        this.createConfigJob(this.modalInputValue)
      this.modalInputValue = ""
    });
	}
  ngOnInit() {
    this.multi  = SnippetType.multi;


    this.jenkinsConfigJobForm = new FormGroup({
      jenkinsConfigJobInput: new FormControl('', [
        Validators.required,
        Validators.minLength(10)
      ])
    })

    this.jenkinsGenForm = new FormGroup({
      jenkinsGenInput: new FormControl('', [
        Validators.required,
        Validators.minLength(10)
      ])
    });


    this.dockerGenForm = new FormGroup({
      dockerGenInput: new FormControl('', [
        Validators.required,
        Validators.minLength(10)
      ])
    });

    this.ocpConfigGenForm = new FormGroup({
      ocpConfigGenInput: new FormControl('', [
        Validators.required,
        Validators.minLength(10)
      ])
    });
  }

  get jenkinsConfigJobInput() {
    return this.jenkinsConfigJobForm?.get('jenkinsConfigJobInput')?.value
  }

  get jenkinsGenInst() {
    return this.jenkinsGenForm?.get('jenkinsGenInst')?.value;
  }

  get jenkinsGenInput() {
    return this.jenkinsGenForm?.get('jenkinsGenInput')?.value;
  }

  get dockerGenInst() {
    return this.dockerGenForm?.get('dockerGenInst')?.value;
  }

  get dockerGenInput() {
    return this.dockerGenForm?.get('dockerGenInput')?.value;
  }

  get ocpConfigGenInst() {
    return this.ocpConfigGenForm?.get('ocpConfigGenInst')?.value;
  }

  get ocpConfigGenInput() {
    return this.ocpConfigGenForm?.get('ocpConfigGenInput')?.value;
  }

  generateJenkinsConfigJob(responseDataFor:any){
    let body = {
      input: this.jenkinsConfigJobExample + '\n\nInput:' + this.jenkinsConfigJobInput + '\\nOutput:',
      model_id: "ibm/granite-34b-code-instruct",
      parameters: {
        "decoding_method": "greedy",
        "max_new_tokens": 8191,
        "min_new_tokens": 100,
        "stop_sequences": [
          "Input:"
        ],
        "repetition_penalty": 1
      },
      project_id: this.projectId
    };
    console.log(body.input)
    /*if (this.jenkinsGenForm.invalid) {
      this.jenkinsGenInputInvalid = true;
      this.jenkinsGenInputInvalidText = "Please enter correct information";
    }
    else {*/
      this.jenkinsConfigJobInputInvalid = false;
      this.askWatson(body, this.generateJenkinsJobConfig_respone, responseDataFor);
    
  }

  generateJenkins(responseDataFor: any) {
    let body = {
      input: this.placeholderJenkinsGenInst + '\n\nInput:' + this.jenkinsGenInput + '\nOutput:',
      model_id: "ibm/granite-34b-code-instruct",
      parameters: {
        "decoding_method": "greedy",
        "max_new_tokens": 8191,
        "min_new_tokens": 100,
        "stop_sequences": [
          "Input:"
        ],
        "repetition_penalty": 1
      },
      project_id: this.projectId
    };
    console.log(body.input)
    /*if (this.jenkinsGenForm.invalid) {
      this.jenkinsGenInputInvalid = true;
      this.jenkinsGenInputInvalidText = "Please enter correct information";
    }
    else {*/
      this.jenkinsGenInputInvalid = false;
      this.askWatson(body, this.generateJenkins_response, responseDataFor);
    
  }

  generateDocker(responseDataFor: any) {
    let body = {
      input: this.placeholderDockerGenInst + '\n\nInput:' + this.dockerGenInput + '\n\nOutput:',
      model_id: "ibm/granite-34b-code-instruct",
      parameters: {
        "decoding_method": "greedy",
        "max_new_tokens": 8191,
        "min_new_tokens": 100,
        "stop_sequences": [
          "Input:"
        ],
        "repetition_penalty": 1
      },
      project_id: this.projectId
    };
    console.log(body.input)
    /*if (this.dockerGenForm.invalid) {
      this.dockerGenInputInvalid = true;
      this.dockerGenInputInvalidText = "Please enter correct information";
    }
    else {*/
      this.dockerGenInputInvalid = false;
      this.askWatson(body, this.generateDocker_response, responseDataFor);
    
  }

  generateOCPConfig(responseDataFor: any) {
    let body = {
      input: this.placeholderOCPConfigGenInst + '\n\nInput:' + this.ocpConfigGenInput + '\n\nOutput:',
      model_id: "ibm/granite-34b-code-instruct",
      parameters: {
        "decoding_method": "greedy",
        "max_new_tokens": 8191,
        "min_new_tokens": 100,
        "stop_sequences": [],
        "repetition_penalty": 1
      },
      project_id: this.projectId
    };
    console.log(body.input)
    /*if (this.ocpConfigGenForm.invalid) {
      this.ocpConfigGenInputInvalid = true;
      this.ocpConfigGenInputInvalidText = "Please enter correct information";
    }
    else {*/
      this.ocpConfigGenInputInvalid = false;
      this.askWatson(body, this.generateOCPConfig_response, responseDataFor);
    
  }

  askWatson(body: any, placeholder: FormControl, responseDataFor: any) {
    this.loadingVisible = true;
    this.generateJenkinsConfigJobResultVisible = false
    this.generateJenkinsResultsVisible = false;
    this.generateDockerResultsVisible = false;
    this.generateOCPConfigResultsVisible = false;
    this.isActive = true;
    this.overlay = true;
    this.service.askWatson(JSON.stringify(body)).subscribe({
      next: (value) => {
        console.log(value);
        console.log('Observable emitted the next value: ' + value);
        this.original_repsone = value.results[0].generated_text;
        this.displayData = value.results[0].generated_text.replace(/\\n/g, "\n").replace(/\\/g,"");//replace(/\n/g, '<br />');
        if(this.displayData.endsWith("Input:"))
          this.displayData = this.displayData.replace(/Input:([^_]*)$/, '$1')
        if(responseDataFor === 'generateJenkinsConfigJob'){
          this.generateJenkinsConfigJobResultVisible = true
          this.model = {
            value: this.displayData.trim() || "",
            language: 'xml'
          }
        }
        if (responseDataFor === 'generateJenkins') {
          this.generateJenkinsResultsVisible = true
        }
        if (responseDataFor === 'generateDocker') {
          this.generateDockerResultsVisible = true
        }
        if (responseDataFor === 'generateOCPConfig') {
          this.generateOCPConfigResultsVisible = true
        }
        this.loadingVisible = false;
        this.isActive = false;
        this.overlay = false;

        placeholder.setValue(this.displayData);
      },
      error: (err) => {
        console.error('Observable emitted an error: ' + err)
        this.notificationObj = {
          type: 'error',
          title: 'Something went wrong!',
          subtitle: 'Please try again after some time.',
          caption: '',
          showClose: true
      }
      this.notificationShow = true
      this.loadingVisible = false;
      this.isActive = false;
      this.overlay = false;
      },
      complete: () => {
        console.log('Observable emitted the complete notification')
        this.loadingVisible = false;
      }
    });

  }

  download(responseDataFor: any) {
    let fileName = 'output.txt';
    if (responseDataFor === 'generateJenkins') {
      fileName = 'Jenkinsfile';
    }
    if (responseDataFor === 'generateDocker') {
      fileName = 'Dockerfile';
    }
    if (responseDataFor === 'generateOCPConfig') {
      fileName = 'ocp.yaml';
    }

    let fileContent =  this.original_repsone.replace(/\\n/g, "\n").replace(/\\/g,"");
    const file = new Blob([fileContent], {type: "text/plain"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = fileName;
    link.click();
    link.remove();
  }
  createConfigJob(name: string) {
    console.log(name, this.xmlText)
    this.loadingVisible = true
    this.isActive = true;
    this.overlay = true;
    this.service.createJenkinsJob(this.xmlText, name).subscribe({
      next: (value) => {
        this.notificationObj = {
          type: 'success',
          title: 'Job creation success',
          subtitle: 'Jenkins Job was created successfully',
          caption: '',
          showClose: true
      }
      this.loadingVisible = false;
      this.notificationShow =true
      this.isActive = false;
      this.overlay = false;
      this.showNextStage = true
      },
      error: (err) => {
        this.notificationObj = {
          type: 'error',
          title: 'Job creation failed',
          subtitle: 'Something went wrong.',
          caption: '',
          showClose: true
      }
        this.loadingVisible = false;
        this.isActive = false;
        this.overlay = false;
        this.notificationShow =true
        console.error('Observable emitted an error: ' + err)
      },
      complete: () => {
        console.log('Observable emitted the complete notification')
        this.loadingVisible = false;
        this.notificationShow =true
      }
  })
  }

  getLatestXML(config:string){
    this.xmlText = config
  }
}