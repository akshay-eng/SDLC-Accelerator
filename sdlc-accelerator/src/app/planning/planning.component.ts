import { Component, ElementRef, EventEmitter, HostBinding, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ButtonModule,
  GridModule,
  ProgressIndicatorModule,
  LoadingModule,
  InlineLoadingModule,
  InlineLoadingState,
  InputModule,
  TabsModule,
  FileUploaderModule,
  FileItem,
  IconModule,
  IconService,
  LayoutModule,
  CodeSnippetModule,
  StackDirective,
  SnippetType,
  TilesModule,
  NotificationModule,

} from 'carbon-components-angular';


import { APIServiceService } from '../service/apiservice.service';
import { CacheServiceService } from '../service/cache-service.service';
import { BehaviorSubject } from 'rxjs';
import { FormsModule, FormControl, FormBuilder, FormGroup, Validators, ReactiveFormsModule , ValidatorFn, ValidationErrors, AbstractControl} from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import Download20 from '@carbon/icons/es/download/20';

import * as fs from "fs";
import { Document, Paragraph, Packer, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { TitleComponent } from "../title/title.component";
import { ActivatedRoute, Router } from '@angular/router';
import { fileUploadCheck } from '../utils/fileUploadCheck';

declare const Word: any;

@Component({
    selector: 'planning',
    standalone: true,
    templateUrl: './planning.component.html',
    styleUrl: './planning.component.scss',
    imports: [CommonModule,
        FormsModule,
        ReactiveFormsModule,
        GridModule,
        ProgressIndicatorModule,
        ButtonModule,
        LoadingModule,
        InlineLoadingModule,
        InputModule,
        TabsModule,
        FileUploaderModule,
        IconModule,
        LayoutModule,
        CodeSnippetModule,
        TilesModule, TitleComponent, NotificationModule]
})
export class PlanningComponent implements OnInit {

  condensed = false;
  narrow = true;
  fullWidth = true;

  @ViewChild('watsonData') watsonData!: ElementRef;

  @Input() progressIndicator9Steps = [
    { label: "Step 1", text: "Step 1", description: "Optional label", state: ["incomplete"] },
    { label: "Step 2", text: "Step 2", description: "Optional label", state: ["inprogress"] }
  ];
  @Input() progressIndicator9Orientation = '"vertical"';
  @Input() progressIndicator9Spacing = true;
  @Input() progressIndicator9Current = 0;

  @Output() progressIndicator9StepSelected = new EventEmitter<Event>();

  private input: string | undefined;
  private model_id: string | undefined;
  private parameters: any;
  private project_id: string | undefined;

  isActive = false;
  normal = "normal";
  overlay = true;
  loadingVisible = false;

  activeTab=0

  userStoryResultsVisible = false;
  updateRequirementDocResultsVisible = false;
  //resultsVisible = false;

  multi: any = SnippetType.multi;

  @Input() loadingText = "Loading..";
  @Input() successText = "";
  @Input() errorText = "";
  @Output() onSuccess: EventEmitter<any> = new EventEmitter<any>();
  @HostBinding("class.cds--content") loadingClass = true;

  state = InlineLoadingState.Hidden;

  access_token = new BehaviorSubject<string>('');

  size: any = "lg";
  userStoryInvalid: boolean = false;
  userStoryInvalidText: string = "";

  updateReqDocInstInvalid: boolean = false;
  updateReqDocInstInvalidText: string = "";

  updateReqDocInputInvalid: boolean = false;
  updateReqDocInputInvalidText: string = "";

  invalid: boolean = false;
  invalidText: string = "";
  warn: boolean = false;
  disabled: boolean = false;
  theme: any = "dark";
  placeholderUserStories: any = "For an existing movie review application, there is feature to add and update new movie tile along with a rating and review. Create 5-6 user stories for a new feature - Delete an existing movie tile along with its rating and review.";
  placeholderGenReqDocInst: any = "Generate the requirement document for an existing movie-review application, code for which is given below. Provide the requirement document in word format.";
  placeholderGenReqDocInput: any = "i.e., from flask import Flask, render_template, redirect, url_for, request from flask_bootstrap...";
  placeholderUpReqDocInst: any = "Update and enhance the given movie review application requirement document by adding the given user stories. ";
  placeholderUpReqDocInput: any = "Upload Requirement Document then add use stories here";

  autocomplete: any;

  projectId: string = "ebc65ffd-b66f-4c10-b901-894ce0c61053";
  userStoryForm!: FormGroup;
  //userStory!: string;
  generateReqDocForm!: FormGroup
  //generateReqDoc!: string;
  updateReqDocForm!: FormGroup;
  //updateReqDoc!: string;

  fileUploadSourceCodeTitle="Please provide source code";
  fileUploadSourceCodeDescription="Select a file to import";
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

  getUserStories_response = new FormControl('');
  // generateRequirementDoc_response = new FormControl('');
  updateRequirementDoc_response = new FormControl('');

  orientation = "'vertical'";
  gap = 1;

  original_repsone!: string;

  notificationObj = {
    type: 'success' as any,
    title: 'Sample toast',
    subtitle: 'Sample subtitle message',
    caption: 'Sample caption',
    showClose: true
  }

  notificationShow = false;
  constructor(private service: APIServiceService, public router: Router, private activatedRoute: ActivatedRoute,
    private fb: FormBuilder, protected iconService: IconService) {
    iconService.registerAll([
      Download20
    ]);
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      console.log(params);
    });
    this.userStoryForm = new FormGroup({
      userStory: new FormControl('', [
        Validators.required,
        Validators.minLength(10)
      ])
    });


    this.updateReqDocForm = new FormGroup({
      //files: new FormControl(new Set<any>(), [Validators.required]),
      updateReqDocInst: new FormControl('', [
        Validators.required,
        Validators.minLength(10)
      ]),
      updateReqDocInput: new FormControl('', [
        Validators.required,
        Validators.minLength(10)
      ]),
      updateReqDocFileInput: new FormControl('', [Validators.required, fileUploadCheck()])
    });
  }

  get userStory() {
    return this.userStoryForm?.get('userStory')?.value;
  }

  get generateReqDocInst() {
    return this.generateReqDocForm?.get('generateReqDocInst')?.value;
  }

  get generateReqDocInput() {
    return this.generateReqDocForm?.get('generateReqDocInput')?.value;
  }

  get updateReqDocInst() {
    return this.updateReqDocForm?.get('updateReqDocInst')?.value;
  }

  get updateReqDocInput() {
    return this.updateReqDocForm?.get('updateReqDocInput')?.value;
  }


  getUserStories(responseDataFor: any) {
    let body = {
      input: this.userStory,
      model_id: "mistralai/mixtral-8x7b-instruct-v01",
      parameters: {
        min_new_tokens: 100,
        max_new_tokens: 600
      },
      project_id: this.projectId
    };
    console.log(body.input)
    /*if (this.userStoryForm.invalid) {
      this.userStoryInvalid = true;
      this.userStoryInvalidText = "Please enter correct information";
    }
    else {
      this.userStoryInvalid = false;*/
      this.askWatson(body, this.getUserStories_response, responseDataFor);
    
  }

  // generateRequirementDoc(responseDataFor: any) {
  //   this.sourceCodeFiles.forEach(fileItem => {
  //     fileItem.file.text()
  //       .then((data) => {

  //         console.log(`File: ${fileItem.file.name}`);
  //         console.log('File contents:');
  //         console.log(data);
  
  //         let body = {
  //           input: this.generateReqDocInst + '\n\nInput:' + data + '\n\nOutput:',
  //           model_id: "mistralai/mixtral-8x7b-instruct-v01",
  //           parameters: {
  //             "decoding_method": "greedy",
  //             "max_new_tokens": 16384,
  //             "min_new_tokens": 100,
  //             "stop_sequences": [],
  //             "repetition_penalty": 1
  //           },
  //           project_id: this.projectId
  //         };
  //         console.log(body.input)
  //         this.askWatson(body, this.generateRequirementDoc_response, responseDataFor);

  //         /* if (this.generateReqDocForm.invalid) {
  //           this.generateReqDocInputInvalid = true;
  //           this.generateReqDocInputInvalidText = "Please enter correct information";
  //         }
  //         else {
  //           this.generateReqDocInputInvalid = false;
  //           this.askWatson(body, this.generateRequirementDoc_response, responseDataFor);
  //         } */
  //       })
  //       .catch((error) => {
  //         console.log("Promise rejected with " + JSON.stringify(error));
  //       });
  //   });
  // }

  updateRequirementDoc(responseDataFor: any) {
    this.updateRequirementDocResultsVisible = false;
    const formData = new FormData();
    this.files.forEach(fileItem => {
      formData.append('file', fileItem.file);
    });
    
    this.service.extractText(formData).subscribe((result: any) => {
      console.log(result);
      let body = {
        input: this.updateReqDocInst + "Do not add user stories in the requirement document." + '\n\nInput:\nRequirement Document:\n\n' + result.result + "\n\nUser stories:\n\n" + this.updateReqDocInput + '\n\nOutput:',
        model_id: "mistralai/mixtral-8x7b-instruct-v01",
        parameters: {
          decoding_method: "greedy",
          min_new_tokens: 100,
          max_new_tokens: 16384,
          stop_sequences: [],
          repetition_penalty: 1
        },
        project_id: this.projectId
      };
      console.log(body.input)
      /*if (this.updateReqDocForm.invalid) {
        this.updateReqDocInputInvalid = true;
        this.updateReqDocInputInvalidText = "Please enter correct information";
      }
      else {
        this.updateReqDocInputInvalid = false;*/
        this.askWatson(body, this.updateRequirementDoc_response, responseDataFor);
      
    });
  }
  
  askWatson(body: any, placeholder: FormControl, responseDataFor: any) {
    this.loadingVisible = true;
    //this.resultsVisible = false;

    this.userStoryResultsVisible = false;
    this.updateRequirementDocResultsVisible = false;

    this.state = InlineLoadingState.Active;
    this.loadingText = "Getting Watsonx Data";
    this.isActive = true;
    this.overlay = true;
    this.service.askWatson(JSON.stringify(body)).subscribe({
      next: (result) => {
      if (responseDataFor === 'userStory') {
        this.userStoryResultsVisible = true
        this.updateReqDocForm.setValue({
          updateReqDocInst: '',
          updateReqDocInput: result.results[0].generated_text.replace(/\n/g, '\n'),
          updateReqDocFileInput: ''
        })
      }if (responseDataFor === 'updateRequirementDoc') {
        this.updateRequirementDocResultsVisible = true
      }
      this.loadingVisible = false;
      this.state = InlineLoadingState.Hidden;
      this.isActive = false;
      this.overlay = false;
      this.original_repsone = result.results[0].generated_text;
      let tunedOutput = result.results[0].generated_text.replace(/\n/g, '<br />');
      if(tunedOutput.endsWith("Input:"))
        tunedOutput = tunedOutput.replace(/Input:([^_]*)$/, '$1')
      placeholder.setValue(tunedOutput);
    },
      error: (error) => {
        console.log("----", error);
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

  onDropped(event: any) {
    const transferredFiles:any = Array.from(event);
    if(transferredFiles.length > 0){
      const reader = new FileReader();
      let file = transferredFiles[0].file
      reader.onload = (e) => {
        const content = e.target?.result;
        console.log(reader.result);
        this.fileContent = reader.result as string;
        this.showFileContentDisplayButton = true;
      };
      reader.readAsText(file);
    } else {
      this.fileContent = "";
      this.showFileContent= false;
      this.showFileContentDisplayButton = false;
    }
  }

  displayFileContent(){
    this.showFileContent= true;
  }

  openPDF1() {
    let DATA: any = document.getElementById('watsonData');
    html2canvas(DATA).then((canvas) => {
      let fileWidth = 208;
      let fileHeight = (canvas.height * fileWidth) / canvas.width;
      const FILEURI = canvas.toDataURL('image/png');
      let PDF = new jsPDF('p', 'mm', 'a4');
      let position = 20;
      PDF.addImage(FILEURI, 'PNG', 10, position, fileWidth, fileHeight);
      PDF.save('Watson Response.pdf');
    });
  }

  download(responseDataFor: any) {
    let data: any;
    let fileName = "Initial Requirement Document.docx"
    if (responseDataFor === 'userStory') {
      data = this.getUserStories_response.value;
      fileName = "User Story Document.docx"
    } 
    // else if (responseDataFor === 'generateRequirementDoc') {
    //   data = this.generateRequirementDoc_response.value;
    //   fileName = "Initial Requirement Document.docx"
    // }
     if (responseDataFor === 'updateRequirementDoc') {
      data = this.updateRequirementDoc_response.value;
      fileName = "Final Requirement Document.docx"
    }
    let DATA: any = document.getElementById('getUserStoriesData');

    //let data1: string = data.replace('<br />', /\n/g)
    console.log(data)
    if (data) {
      let children = [];
      let spliData = data.split('<br /><br />');
      for (let i = 0; i < spliData.length; i++) {
        children.push(
          new TextRun({
            text: spliData[i].replaceAll('<br />', ''),
            bold: false,
          }),
          new TextRun({
            text: "",
            break: 1,
          })
        );
      }
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
      console.log(data);
      console.log(this.original_repsone);
      console.log(DATA);
      console.log(doc);
      Packer.toBlob(doc).then((buffer) => {
        saveAs(buffer, fileName);
      });
    }

  }
}
