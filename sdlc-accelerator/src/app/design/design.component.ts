import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule, FormControl, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule, GridModule, IconModule, IconService, InputModule, LayoutModule, LoadingModule, StackDirective, FileUploaderModule,TabsModule, FileItem, NotificationModule } from 'carbon-components-angular';
import { APIServiceService } from '../service/apiservice.service';
import Download20 from '@carbon/icons/es/download/20';
import { Document, Paragraph, Packer, TextRun, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import { TitleComponent } from '../title/title.component';
import { fileUploadCheck } from '../utils/fileUploadCheck';
import { Router } from '@angular/router';

@Component({
  selector: 'design',
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
    FileUploaderModule,
    TitleComponent,
  NotificationModule],
  templateUrl: './design.component.html',
  styleUrl: './design.component.scss'
})
export class DesignComponent {
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

  lldGenInstInvalid: boolean = false;
  lldGenInstInvalidText: string = "";
  ucdGenInstInvalid: boolean = false;
  ucdGenInstInvalidText: string = "";
  sdGenInstInvalid: boolean = false;
  sdGenInstInvalidText: string = "";

  lldGenInputInvalid: boolean = false;
  lldGenInputInvalidText: string = "";
  ucdGenInputInvalid: boolean = false;
  ucdGenInputInvalidText: string = "";
  sdGenInputInvalid: boolean = false;
  sdGenInputInvalidText: string = "";

  placeholderLLDGenInst: any = "Generate low level design document for the provided requirement document.";
  placeholderLLDGenInput: any = "1. As a user, I want to be able to delete a movie tile, so that I can remove any movie that I no longer want to see listed";

  placeholderUCDGenInst: any = "i.e., Given the use case description, generate a plantUML code for drawing use case diagram";
  placeholderUCDGenInput: any = "i.e., Use case for meal delivery application: ";

  placeholderSDGenInst: any = "i.e., Generate a plantUML code for sequence diagram, for the functional requirements from the given requirement document";
  placeholderSDGenInput: any = "i.e., Movie Review Application Requirement Document";

  generateLLDDocResultsVisible = false;
  generateUCDDocResultsVisible = false;
  generateSDDocResultsVisible = false;

  lldGenForm!: FormGroup;
  ucdGenForm!: FormGroup;
  sdGenForm!: FormGroup;

  generateLLDDoc_response = new FormControl('');
  generateUCDDoc_response = new FormControl('');
  generateSDDoc_response = new FormControl('');

  original_repsone!: string;
  diagramImg: any;

  fileUploadSourceCodeTitle="Please provide source code";
  fileUploadSourceCodeDescription="Select a file to import that is in a py/html format";
  fileUploadTitle = "Upload Requirement Document";
  fileUploadDescription = "Select a file to import that is in a doc/docx format";
  fileUploadDropText = "Drag and drop files here or click to upload";
  @Input() accept = [".doc", ".docx"];
  @Input() sourceCodeAccept = [".py", ".html"];
  @Input() fileItemSize: "sm" | "md" | "lg" = "lg";
  @Input() files = new Set<FileItem>();
  @Input() sourceCodeFiles = new Set<FileItem>();
  @Input() showFileContent:boolean = false;
  @Input() showFileContentDisplayButton:boolean = false;
  @Input() fileContent:string = "";
  maxSize = 500000;

  reqDocContent = "";

  notificationObj = {
    type: 'success' as any,
    title: 'Sample toast',
    subtitle: 'Sample subtitle message',
    caption: 'Sample caption',
    showClose: true
  }

  notificationShow = false;
  constructor(private service: APIServiceService,
    private fb: FormBuilder,public router: Router ,protected iconService: IconService) {
    iconService.registerAll([
      Download20
    ]);
  }

  ngOnInit() {
    this.lldGenForm = new FormGroup({
      lldGenInst: new FormControl('', [
        Validators.required,
        Validators.minLength(10)
      ]),
      lldGenFileInput: new FormControl('', [
        Validators.required,
        fileUploadCheck()
      ])
    });


    this.ucdGenForm = new FormGroup({
      ucdGenInst: new FormControl(''),
      ucdGenInput: new FormControl('', [
        Validators.required,
        Validators.minLength(10)
      ])
    });

    this.ucdGenForm.controls['ucdGenInput'].valueChanges.subscribe(change => {
      this.ucdGenInputInvalid = false;
      this.ucdGenInputInvalidText = '';
    });

    this.sdGenForm = new FormGroup({
      sdGenInst: new FormControl(this.placeholderLLDGenInst),
      sdGenInput: new FormControl('', [
        Validators.required,
        Validators.minLength(10)
      ])
    });

    this.sdGenForm.controls['sdGenInput'].valueChanges.subscribe(change => {
      this.sdGenInputInvalid = false;
      this.sdGenInputInvalidText = '';
    });
  }

  get lldGenInst() {
    return this.lldGenForm?.get('lldGenInst')?.value;
  }

  get lldGenInput() {
    return this.lldGenForm?.get('lldGenInput')?.value;
  }

  get ucdGenInst() {
    return this.ucdGenForm?.get('ucdGenInst')?.value;
  }

  get ucdGenInput() {
    return this.ucdGenForm?.get('ucdGenInput')?.value;
  }

  get sdGenInst() {
    return "Generate a plantUML code for sequence diagram, for the functional requirements from the given requirement document"
  }

  get sdGenInput() {
    return this.sdGenForm?.get('sdGenInput')?.value;
  }

  async generateLLDDoc(responseDataFor: any) {
    const formData = new FormData();
    this.files.forEach(fileItem => {
      formData.append('file', fileItem.file);
    });
    
    this.service.extractText(formData).subscribe((result: any) => {

      let lldBody = {
        input: this.lldGenInst + '\n\nInput:' + result.result + '\n\nOutput:',
        model_id: "mistralai/mixtral-8x7b-instruct-v01",
        parameters: {
          "decoding_method": "greedy",
          "max_new_tokens": 16384,
          "min_new_tokens": 100,
          "stop_sequences": [],
          "repetition_penalty": 1
        },
        project_id: this.projectId
      };

      let sdBody = {
        input: this.sdGenInst + '\n\nInput:' + result.result + '\n\nOutput:',
        model_id: "mistralai/mixtral-8x7b-instruct-v01",
        parameters: {
          "decoding_method": "greedy",
          "max_new_tokens": 16384,
          "min_new_tokens": 100,
          "stop_sequences": [],
          "repetition_penalty": 1
        },
        project_id: this.projectId
      };
      console.log(lldBody.input)
      console.log(sdBody.input)
      /*if (this.lldGenForm.invalid) {
        this.lldGenInputInvalid = true;
        this.lldGenInputInvalidText = "Please enter correct information";
      }
      else {*/
        this.lldGenInputInvalid = false;
        this.askWatson(lldBody, this.generateLLDDoc_response, 'generateLLDDoc');
        this.askWatson(sdBody, this.generateSDDoc_response, 'generateSDDoc');
    })
  }

  // generateUCDDoc(responseDataFor: any) {
  //   let body = {
  //     input: this.ucdGenInst + '\n\nInput:' + this.ucdGenInput + '\n\nOutput:',
  //     model_id: "mistralai/mixtral-8x7b-instruct-v01",
  //     parameters: {
  //       "decoding_method": "greedy",
  //       "max_new_tokens": 4096,
  //       "min_new_tokens": 100,
  //       "stop_sequences": [],
  //       "repetition_penalty": 1
  //     },
  //     project_id: this.projectId
  //   };
  //   if (this.ucdGenForm.invalid) {
  //     this.ucdGenInputInvalid = true;
  //     this.ucdGenInputInvalidText = "Please enter correct information";
  //   }
  //   else {
  //     this.ucdGenInputInvalid = false;
  //     this.askWatson(body, this.generateUCDDoc_response, responseDataFor);
  //   }
  // }

  generateSDDoc(responseDataFor: any) {
    let body = {
      input: this.sdGenInst + '\n\nInput:' + this.reqDocContent + '\n\nOutput:',
      model_id: "mistralai/mixtral-8x7b-instruct-v01",
      parameters: {
        "decoding_method": "greedy",
        "max_new_tokens": 16384,
        "min_new_tokens": 100,
        "stop_sequences": [],
        "repetition_penalty": 1
      },
      project_id: this.projectId
    };

    /*if (this.sdGenForm.invalid) {
      this.sdGenInputInvalid = true;
      this.sdGenInputInvalidText = "Please enter correct information";
    }
    else {
      this.sdGenInputInvalid = false;*/
      this.askWatson(body, this.generateSDDoc_response, responseDataFor);
    
  }

  askWatson(body: any, placeholder: FormControl, responseDataFor: any) {
    this.loadingVisible = true;
    this.generateLLDDocResultsVisible = false;
    this.isActive = true;
    this.overlay = true;
    this.service.askWatson(JSON.stringify(body)).subscribe({
      next: (value) => {
        console.log(value);
        console.log('Observable emitted the next value: ' + value);
        this.original_repsone = value.results[0].generated_text;
        let tunedOutput = value.results[0].generated_text.replace(/\n/g, '<br />');
        let diagramData;
        if (responseDataFor === 'generateLLDDoc') {
          this.generateLLDDocResultsVisible = true
          if(this.generateLLDDocResultsVisible === true && this.generateSDDocResultsVisible === true){
            this.loadingVisible = false
            this.isActive = false;
            this.overlay = false;
          }
        }
        if (responseDataFor === 'generateUCDDoc') {
          diagramData = this.original_repsone;
          this.service.getDiagram(diagramData).subscribe({
            next: (value) => {
              this.generateUCDDocResultsVisible = true
              this.createImageFromBlob(value);
              this.loadingVisible = !this.loadingVisible;
              this.isActive = false;
              this.overlay = false;
            },
            error: (err) => {
              console.log(err);
            }
          });
        }
        if (responseDataFor === 'generateSDDoc') {
          diagramData = this.original_repsone;
          this.service.getDiagram(diagramData).subscribe({
            next: (value) => {
              this.generateSDDocResultsVisible = true
              this.createImageFromBlob(value);
              if(this.generateLLDDocResultsVisible === true && this.generateSDDocResultsVisible===true){
                this.loadingVisible = false
                this.isActive = false;
                this.overlay = false;
              }
            },
            error: (err) => {
              console.log('getDiagram Error');
              console.log(err);
            }
          });
        }


        placeholder.setValue(tunedOutput);
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
      }
    });

  }
  download(responseDataFor: any) {
    /*let fileName = 'output.png';
    if (responseDataFor === 'generateUCDDoc') {
      fileName = 'usecase_diagram.png';
    }
    if (responseDataFor === 'generateSDDoc') {
      fileName = 'sequence_diagram.png';
    }

    let fileContent = this.diagramImg;
    const file = new Blob([fileContent]);
    const link = document.createElement("a");
    link.href = fileContent;
    link.download = fileName;
    link.click();
    link.remove();*/
    let data = this.generateLLDDoc_response.value
    console.log(data)
    if (data) {
      let children = [];
      let splitData = data.split('<br /><br />');
      console.log(splitData)
      for (let i = 0; i < splitData.length; i++) {
        children.push(
          new TextRun({
            text: splitData[i].replaceAll('<br />', ''),
            bold: false,
          }),
          new TextRun({
            text: "",
            break: 1,
          })
        );
      }
      const image = new ImageRun({
        
        data: this.diagramImg,
        transformation: {
            width: 300,
            height: 300,
        },
    });
    children.push(
      new TextRun({
        text: 'Sequence Diagram',
        bold: true
      }),
      new TextRun({
        text: "",
        break: 1,
      }), image
    )
      let doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: children
              }),
            ],
          },
        ]
      });
      Packer.toBlob(doc).then((buffer) => {
        saveAs(buffer, "LLD Document.docx");
      });
    }
  }
  createImageFromBlob(image: Blob) {
    let reader = new FileReader();

    reader.onloadend = () => {
      this.diagramImg = reader.result;
    }
    /* reader.addEventListener("load", () => {
       this.previewSignsrc = reader.result;
    }, false);
  */
    if (image) {
      reader.readAsDataURL(image);
    }
  }

  async onDropped(event: any){
    const transferredFiles:any = Array.from(event);
    if(transferredFiles.length > 0){
      const reader = new FileReader();
      let file = transferredFiles[0].file
      reader.onload = async (e) => {
          this.reqDocContent = reader.result as string;
      };
        reader.readAsText(file);
    } else {
      this.reqDocContent = ""
    }
  }
}

