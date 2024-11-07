import { CommonModule} from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TabsModule, GridModule, LayoutModule, InputModule, ButtonModule, LoadingModule, IconModule, CodeSnippetModule, I18n, IconService, FileItem, FileUploaderModule, NotificationModule } from 'carbon-components-angular';
import { APIServiceService } from '../service/apiservice.service';
import Download20 from '@carbon/icons/es/download/20';
import { TitleComponent } from '../title/title.component';
import { Document, Paragraph, Packer, TextRun, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import { fileUploadCheck } from '../utils/fileUploadCheck';
import { Router } from '@angular/router';

@Component({
  selector: 'testing',
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
    FileUploaderModule,
  NotificationModule],
  templateUrl: './testing.component.html',
  styleUrl: './testing.component.scss'
})
export class TestingComponent {
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

  testCaseInstInvalid: boolean = false;
  testCaseInstInvalidText: string = "";

  testCaseInputInvalid: boolean = false;
  testCaseInputInvalidText: string = "";

  placeholderTestCaseInst: any = "Provide 4-5 functional test-cases for the given requirement document.";
  placeholderTestCaseInput: any = "1.e., 1. As a user, I want to be able to delete a movie tile, so that I can remove any movie that I no longer want to see listed.";

  generateTestCaseResultsVisible = false;

  testCaseForm!: FormGroup;
  generateTestCase_response = new FormControl('');

  fileUploadSourceCodeTitle="Please provide source code";
  fileUploadTitle = "Upload Requirement Document";
  fileUploadDescription = "Select a file to upload requirement document";
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
  

  displayData= "";
  original_repsone!: string;

  notificationObj = {
    type: 'success' as any,
    title: 'Sample toast',
    subtitle: 'Sample subtitle message',
    caption: 'Sample caption',
    showClose: true
  }

  notificationShow = false;
  constructor(private service: APIServiceService, public router: Router,
    private fb: FormBuilder, protected iconService: IconService, protected i18n: I18n) {
    iconService.registerAll([
      Download20
    ]);
  }

  ngOnInit() {
    this.displayData="";
    this.testCaseForm = new FormGroup({
      testCaseInst: new FormControl('',[
        Validators.required,
        Validators.minLength(10)
      ] ),
      testCaseFileInput: new FormControl('', [
        Validators.required,
        fileUploadCheck()
      ])
    });
  }

  get testCaseInst() {
    return this.testCaseForm?.get('testCaseInst')?.value;
  }

  get testCaseInput() {
    return this.testCaseForm?.get('testCaseInput')?.value;
  }

  generateTestCase(responseDataFor: any){
    const formData = new FormData();
    this.files.forEach(fileItem => {
      formData.append('file', fileItem.file);
    });
    
    this.service.extractText(formData).subscribe((result: any) => {

    let body = {
      input: this.testCaseInst + '\n\nInput:' + result.result + '\n\nOutput:',
      model_id: "mistralai/mixtral-8x7b-instruct-v01",
      parameters: {
        "decoding_method": "greedy",
        "max_new_tokens": 16384,
        "min_new_tokens": 0,
        "stop_sequences": [],
        "repetition_penalty": 1
      },
      project_id: this.projectId
    };
    console.log(body.input)
    /*if (this.testCaseForm.invalid) {
      this.testCaseInputInvalid = true;
      this.testCaseInputInvalidText = "Please enter correct information";
    }
    else {*/
      this.testCaseInputInvalid = false;
      this.askWatson(body, this.generateTestCase_response, responseDataFor);
    
  })
  }

  askWatson(body: any, placeholder: FormControl, responseDataFor: any) {
    this.loadingVisible = true;
    this.generateTestCaseResultsVisible = false;
    this.isActive = true;
    this.overlay = true;
    this.service.askWatson(JSON.stringify(body)).subscribe({
      next: (value) => {
        console.log('Observable emitted the next value: ' + value);
        console.log(value)
        if (responseDataFor === 'generateTestCase') {
          this.generateTestCaseResultsVisible = true
        }
        this.loadingVisible = false;
        this.isActive = false;
        this.overlay = false;
        this.original_repsone = value.results[0].generated_text;
        let tunedOutput = value.results[0].generated_text.replace(/\n/g, '<br />');
        placeholder.setValue(tunedOutput);
        this.displayData=tunedOutput;
        if(this.displayData.endsWith("Input:"))
          this.displayData = this.displayData.replace(/Input:([^_]*)$/, '$1')
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
    let data = this.generateTestCase_response.value
    console.log(data)
    if (data) {
      let children = [];
      let splitData = data.split('<br /><br />');
      console.log(splitData)
      for (let i = 0; i < splitData.length; i++) {
        children.push(
          new TextRun({
            text: splitData[i].replaceAll('<br />', '\n'),
            bold: false,
            break: 2
          }),
        );
      }
      let doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: children
              })
            ],
          },
        ]
      });
      Packer.toBlob(doc).then((buffer) => {
        saveAs(buffer, "Testcases.docx");
      });
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
