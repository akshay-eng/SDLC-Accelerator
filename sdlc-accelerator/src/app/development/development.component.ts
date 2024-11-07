import { CommonModule } from '@angular/common';
import { AfterContentChecked, ChangeDetectorRef, Component, HostBinding, Input, OnInit } from '@angular/core';
import { FormsModule, FormControl, FormBuilder, FormGroup, Validators, ReactiveFormsModule  } from '@angular/forms';
import { ButtonModule, CodeSnippetModule,CodeSnippet, GridModule, IconModule, IconService, InputModule, LayoutModule, LoadingModule, StackDirective, TabsModule, SnippetType, I18n, FileUploaderModule,
  FileItem,
  NotificationModule,} from 'carbon-components-angular';
import { APIServiceService } from '../service/apiservice.service';
import Download20 from '@carbon/icons/es/download/20';
import { TitleComponent } from '../title/title.component';
import { fileUploadCheck } from '../utils/fileUploadCheck';
import { Router } from '@angular/router';


@Component({
  selector: 'app-development',
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
    FileUploaderModule,
    TitleComponent,
    NotificationModule
    ],
  templateUrl: './development.component.html',
  styleUrl: './development.component.scss'
})
export class DevelopmentComponent implements OnInit, AfterContentChecked{
  projectId: string = "ebc65ffd-b66f-4c10-b901-894ce0c61053";
  gap = 1;
 
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

  fcodeGenInstInvalid: boolean = false;
  fcodeGenInstInvalidText: string = "";
  bcodeGenInstInvalid: boolean = false;
  bcodeGenInstInvalidText: string = "";

  fcodeGenInputInvalid: boolean = false;
  fcodeGenInputInvalidText: string = "";

  bcodeGenInputInvalid: boolean = false;
  bcodeGenInputInvalidText: string = "";

  placeholderFcodeGenInst: any = "For an existing movie review application, update the given front end code index.html. Generate code for adding a 'Delete' button. Consider the User Interface Design from the given Low level design document";
  placeholderFcodeGenInput: any = "1. index.html \n\n{% extends '\''base.html'\'' %}\n\n\n{% block title %}My Top 10 Movies{% endblock %}\n\n{% block content %}\n<div class=\"container\">";

  placeholderBcodeGenInst: any = "For an existing movie review application's front end index.html is provided to delete a movie tile. Generate the python method for deleting a movie tile Follow the python syntax and indentation when generating python code. Provide brief explanation of generated code.";
  placeholderBcodeGenInput: any = "1. index.html \n\n{% extends '\''base.html'\'' %}\n\n\n{% block title %}My Top 10 Movies{% endblock %}\n\n{% block content %}\n<div class=\"container\">";

  generateFcodeGenResultsVisible = false;
  generateBcodeGenResultsVisible = false;

  fcodeGenForm!: FormGroup;
  bcodeGenForm!: FormGroup;

  generateFcode_response = new FormControl('');
  generateBcode_response = new FormControl('');
  original_repsone!: string;

  displayData!: string;

  tempVar = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>My Top 10 Movies</title>\n    <link rel=\"stylesheet\" href=\"{{ url_for('static', filename='style.css') }}\">\n    <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css\" integrity=\"sha512-iBBXcOa+q1lZFXJ88ZQlhtje6jvF6Qb6QZk+4D58F0GW15P5m7v+y4jN4lyyh3v1j/3Xo3XD3o6gLf+Nz4wAQ==\" crossorigin=\"anonymous\" referrerpolicy=\"no-referrer\" />\n</head>\n<body>\n    <div class=\"container\">\n        <h1 class=\"heading\">My Top 10 Movies</h1>\n        <p class=\"description\">These are my all-time favourite movies.</p>\n        {% for movie in movies %}\n            <div class=\"card\" >\n                <div class=\"front\" style=\"background-image: url('{{movie.img_url}}');\">\n                    <p class=\"large\">{{ movie.ranking }}</p>\n                </div>\n                <div class=\"back\">\n                    <div>\n                        <div class=\"title\">{{movie.title}} <span class=\"release_date\">({{movie.year}})</span></div>\n                        <div class=\"rating\">\n                            <label>{{movie.rating}}</label>\n                            <i class=\"fas fa-star star\"></i>\n                        </div>\n                        <p class=\"review\">\"{{movie.review}}\"</p>\n                        <p class=\"overview\">{{movie.description}}</p>\n\n                        <a href=\"{{ url_for('rate_movie', id=movie.id) }}\" class=\"button\">Update</a>\n                        <button class=\"button delete-button\" data-movie-id=\"{{movie.id}}\">Delete</button>\n                    </div>\n                </div>\n            </div>\n        {% endfor %}\n    </div>\n    <div class=\"container text-center add\">\n        <a href=\"{{ url_for('add_movie') }}\" class=\"button\">Add Movie</a>\n    </div>\n\n    <script>\n        document.querySelectorAll('.delete-button').forEach(button => {\n            button.addEventListener('click', () => {\n                if (confirm('Are you sure you want to delete this movie?')) {\n                    const movieId = button.getAttribute('data-movie-id');\n                    fetch(`/delete/${movieId}`, {\n                        method: 'DELETE',\n                    }).then(response => {\n                        if (response.ok) {\n                            button.closest('.card').remove();\n                        } else {\n                            alert('Error deleting movie.');\n                        }\n                    });\n                }\n            });\n        });\n    </script>\n</body>\n</html>";

  multi: any;
  @Input() translations: any;
  /* @HostBinding("class.cds--snippet--multi") get snippetMultiClass() {
		return this.display === SnippetType.multi;
	} */
  rowHeightInPixel: number = 16;

  fileUploadDropText = "Drag and drop files here or click to upload";
  @Input() fileItemSize: "sm" | "md" | "lg" = "lg";
  fileMaxSize = 500000;

  fileUploadLldDocumentTitle="Please provide LLD document";
  fileUploadLldDocumentDescription="Select a file to upload LLD Document";
  lldDocumentName = "";
  @Input() lldDocumentAccept = [".doc,.docx"];
  @Input() lldDocumentFiles = new Set<FileItem>();
  @Input() lldDocumentContent:string = "";

  fileUploadFrontendSourceCodeTitle="Please provide frontend code";
  fileUploadFrontendSourceCodeDescription="Select a file to upload existing front-end code";
  frontendSourceCodeFileName = "";
  @Input() frontendSourceCodeAccept = [".html"];
  @Input() frontendSourceCodeFiles = new Set<FileItem>();
  @Input() frontendSourceCodeContent:string = "";

  fileUploadFrontendSourceCodeBackendTitle="Please provide frontend code";
  fileUploadFrontendSourceCodeBackendDescription="Select a file to upload existing front-end code";
  frontendSourceCodeBackendFileName = "";
  @Input() frontendSourceCodeBackendAccept = [".html"];
  @Input() frontendSourceCodeBackendFiles = new Set<FileItem>();
  @Input() frontendSourceCodeBackendContent:string = "";

  fileUploadBackendSourceCodeTitle="Please provide backend code";
  fileUploadBackendSourceCodeDescription="Select a file to upload existing back-end code";
  backendSourceCodeFileName = "";
  @Input() backendSourceCodeAccept = [".py"];
  @Input() backendSourceCodeFiles = new Set<FileItem>();
  @Input() backendSourceCodeContent:string = "";

  notificationObj = {
    type: 'success' as any,
    title: 'Sample toast',
    subtitle: 'Sample subtitle message',
    caption: 'Sample caption',
    showClose: true
  }

  notificationShow = false;
  constructor(private service: APIServiceService, public router: Router,private changeDetector: ChangeDetectorRef,
    private fb: FormBuilder, protected iconService: IconService, protected i18n: I18n) {
    iconService.registerAll([
      Download20
    ]);
  }

  ngOnInit() {
    this.translations==this.i18n.get().CODE_SNIPPET;
    this.multi  = SnippetType.multi;
    //this.displayData="";
    this.fcodeGenForm = new FormGroup({
      fcodeGenInst: new FormControl('', [
        Validators.required,
        Validators.minLength(10)
      ]),
      fcodeGenFileInput1: new FormControl('', [
        Validators.required,
        fileUploadCheck()
      ]),
      fcodeGenFileInput2: new FormControl('', [
        Validators.required,
        fileUploadCheck()
      ])
    });

    this.bcodeGenForm = new FormGroup({
      bcodeGenInst: new FormControl('',[
        Validators.required,
        Validators.minLength(10)
      ]),
      bcodeGenFileInput1: new FormControl('', [
        Validators.required,
        fileUploadCheck()
      ]),
      bcodeGenFileInput2: new FormControl('', [
        Validators.required,
        fileUploadCheck()
      ])
    });
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  get fcodeGenInst() {
    return this.fcodeGenForm?.get('fcodeGenInst')?.value;
  }

  get fcodeGenInput() {
    return this.fcodeGenForm?.get('fcodeGenInput')?.value;
  }

  get bcodeGenInst() {
    return this.bcodeGenForm?.get('bcodeGenInst')?.value;
  }

  get bcodeGenInput() {
    return this.bcodeGenForm?.get('bcodeGenInput')?.value;
  }

  generateFcode(responseDataFor: any){
    const formData = new FormData();
    this.lldDocumentFiles.forEach(fileItem => {
      formData.append('file', fileItem.file);
    });
    
    this.service.extractText(formData).subscribe((result: any) => {
console.log("lld document content",result.result)
      let body = {
        input: this.fcodeGenInst + '\n\nInput:\n' + this.frontendSourceCodeFileName + '\n' + this.frontendSourceCodeContent + '\n\nLow level design Document:\n'+result.result+ '\n\nOutput:',
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
      /*if (this.fcodeGenForm.invalid) {
        this.fcodeGenInputInvalid = true;
        this.fcodeGenInputInvalidText = "Please enter correct information";
      }
      else {*/
        console.log(body)
        this.fcodeGenInputInvalid = false;
        this.askWatson(body, this.generateFcode_response, responseDataFor);
    })
    
  }

  generateBcode(responseDataFor: any){
    let body = {
      input: this.bcodeGenInst + '\n\nInput:\n' +  this.frontendSourceCodeBackendFileName + '\n\n' + this.frontendSourceCodeBackendContent + '\n\n'+this.backendSourceCodeFileName+'\n'+this.backendSourceCodeContent+ '\n\nOutput:',
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
    /*if (this.bcodeGenForm.invalid) {
      this.bcodeGenInputInvalid = true;
      this.bcodeGenInputInvalidText = "Please enter correct information";
    }
    else {*/
      console.log(body)
      this.bcodeGenInputInvalid = false;
      this.askWatson(body, this.generateBcode_response, responseDataFor);
    
  }

  askWatson(body: any, placeholder: FormControl, responseDataFor: any) {
    this.loadingVisible = true;
    this.generateFcodeGenResultsVisible = false;
    this.generateBcodeGenResultsVisible = false;
    this.isActive = true;
    this.overlay = true;
    this.service.askWatson(JSON.stringify(body)).subscribe({
      next: (value) => {
        console.log('Observable emitted the next value: ' + value);
        if (responseDataFor === 'generateFcode') {
          this.generateFcodeGenResultsVisible = true
        }
        if (responseDataFor === 'generateBcode') {
          this.generateBcodeGenResultsVisible = true
        }
        this.loadingVisible = false;
        this.isActive = false;
        this.overlay = false;
        this.original_repsone = value.results[0].generated_text;
        //let tunedOutput = value.results[0].generated_text.replace(/\n/g, '<br />').replace(/\n/g, '<br />');
        //let tunedOutput = value.results[0].generated_text.replace(/\\n/g, "\n").replace(/\\/g,"");
        //placeholder.setValue(tunedOutput);
        //this.display1=tunedOutput;
        this.displayData=this.original_repsone.replace(/\\n/g, "\n").replace(/\\/g,"");
        if(this.displayData.endsWith("Input:"))
          this.displayData = this.displayData.replace(/Input:([^_]*)$/, '$1')
        //console.log(this.display1);
        //console.log(tunedOutput);
        //console.log(this.tempVar);
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
      this.loadingVisible = false
      this.isActive = false;
      this.overlay = false;
      },
      complete: () => {
        console.log('Observable emitted the complete notification')
        this.loadingVisible = false
      }
    });
  
  }
  download(responseDataFor: any) {

    let fileName = 'output.txt';
    if (responseDataFor === 'generateFcode') {
      fileName = 'index.html';
    }
    if (responseDataFor === 'generateBcode') {
      fileName = 'main.py';
    }

    let fileContent =  this.displayData;
    const file = new Blob([fileContent], {type: "text/plain"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = fileName;
    link.click();
    link.remove();
  }

  async onDropped(event: any, type: string){
    const transferredFiles:any = Array.from(event);
    if(transferredFiles.length > 0){
      const reader = new FileReader();
      let file = transferredFiles[0].file
      reader.onload = async (e) => {
        if(type==="LLD"){
          this.lldDocumentName = file.name
          this.lldDocumentContent = reader.result as string;
        }
        if(type==="frontend"){
          this.frontendSourceCodeFileName = file.name
          this.frontendSourceCodeContent = reader.result as string;
        }
        if(type==="frontendBackend") {
          this.frontendSourceCodeBackendFileName = file.name
          this.frontendSourceCodeBackendContent = reader.result as string;
        }
        if(type==="backend"){
          this.backendSourceCodeFileName = file.name
          this.backendSourceCodeContent = reader.result as string;
        }
    
      };
        reader.readAsText(file)
    } else {
        if(type==="LLD"){
          this.lldDocumentContent = "";
          this.lldDocumentName = "";
        }
        if(type==="frontend"){
          this.frontendSourceCodeContent = "";
          this.frontendSourceCodeFileName = "";
        }
        if(type==="frontendBackend"){
          this.frontendSourceCodeBackendContent = "";
          this.frontendSourceCodeBackendFileName = "";
        }
        if(type==="backend"){
          this.backendSourceCodeFileName = "";
          this.lldDocumentName = "";
        }
    }

  }

}
