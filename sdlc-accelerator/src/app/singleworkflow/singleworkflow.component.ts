import { Component,  OnInit } from '@angular/core';
import { AccordionModule, CheckboxModule,PlaceholderModule, ButtonModule,ModalModule,ModalService, GridModule, IconModule, IconService, InputModule, LayoutModule, LoadingModule, StackDirective, FileUploaderModule, TabsModule, FileItem, NotificationModule, InlineLoadingModule, InlineLoadingState } from 'carbon-components-angular';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { APIServiceService } from '../service/apiservice.service';
import { Document, Paragraph, Packer, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { FormBuilder } from '@angular/forms';
import {  ElementRef, ViewChild } from '@angular/core';
import { lastValueFrom } from 'rxjs';  // Add this import
import { ModalComponent } from '../modal/modal.component';
import { Observable, Subject } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
@Component({
  selector: 'app-singleworkflow',
  templateUrl: './singleworkflow.component.html',
  styleUrls: ['./singleworkflow.component.scss'],
 standalone: true,
  imports: [ButtonModule, AccordionModule, CheckboxModule,PlaceholderModule, FormsModule, CommonModule ,  ModalModule, FileUploaderModule , ]  // <-- Add CommonModule here
})
export class SingleWorkflowComponent implements OnInit {



  @ViewChild('fileContent') fileContent!: ElementRef;

  uploadForm: FormGroup = new FormGroup({});
  uploadedFileContent: string | undefined;


  constructor (
    protected modalService: ModalService,
    private http: HttpClient,
    private service: APIServiceService,
    protected iconService: IconService,
    private formBuilder: FormBuilder,
  // Replace YourServiceName with your actual service
  ) {
  
  }
  protected modalInputValue = "";
	protected data: Observable<string> = new Subject<string>();
  openModal() {
    this.modalService.create({component: ModalComponent, inputs: {
      inputValue: this.modalInputValue,
			data: this.data
    }});
    }
  userStoryPrompt: string = '';
  generateReqDocForm!: FormGroup;
  generateRequirementDoc_response = new FormControl('');
  loadingVisible = false;
  state = InlineLoadingState.Hidden;
  generateRequirementDocResultsVisible = false;
  projectId: string = "ebc65ffd-b66f-4c10-b901-894ce0c61053"; // Replace with your actual project ID
  userStoryForm!: FormGroup;
  selectedSteps: boolean[] = [false, false, false, false, false];
  downloadOutputs: boolean[] = [false, false, false, false, false];
  steps = [
    { title: 'Reverse-Engineering', prompt: '' ,status:''},
    { title: 'Planning', prompt: '' ,status:'' },
    { title: 'Update Requirement Doc', prompt: '', status: '' },
    { title: 'Generate Test Cases', prompt: '', status: '' },
    { title: 'Design', prompt: '' ,status:'' },
    { title: 'Development', prompt: '' ,status:'' },
    { title: 'Deployment', prompt: '' ,status:'' },
  ];

  downloadAllOutputs: boolean = false;

  generateLLDDoc_response = new FormControl('');
  generateSDDoc_response = new FormControl('');
  diagramImg: string | ArrayBuffer | null = null;
  savedLLDDoc: string = '';
  savedDiagramImg: string | ArrayBuffer | null = null;

  generateFcode_response = new FormControl('');
  generateBcode_response = new FormControl('');
  frontendSourceCodeFileName = 'index.html';
  frontendSourceCodeContent = '';
  frontendSourceCodeBackendFileName = 'index.html';
  backendSourceCodeFileName = 'main.py';
  backendSourceCodeContent:any = '';
  savedFrontendCode = '';

  generateJenkinsConfig_response = new FormControl('');
  generateJenkinsFile_response = new FormControl('');
  generateDockerfile_response = new FormControl('');
  generateOCPConfig_response = new FormControl('');

  savedJenkinsConfig: string = '';
  savedJenkinsFile: string = '';
  savedDockerfile: string = '';
  savedOCPConfig: string = '';

  ngOnInit() {
    this.generateReqDocForm = new FormGroup({
      generateReqDocInst: new FormControl('', [
        Validators.required,
        Validators.minLength(10)
      ])
    });
    this.userStoryForm = this.formBuilder.group({
      userStory: ['', [Validators.required, Validators.minLength(10)]]
    });
  }
  ngAfterContentInit() {
		this.data.subscribe(value => {
      this.modalInputValue = value
      if(value)
        this.createConfigJob(this.modalInputValue)
      this.modalInputValue = ""
    });
	}
  onResetWorkflow(event: any) {
    this.http.delete('http://127.0.0.1:8080/reset-uploads', {}).subscribe({next:(response)=>{
      console.log(response);
      window.location.reload();
    },
    error:(error)=>{
      console.log(error);
 
    }
    })
    this.steps[0].status = '';
  }



  uploadProgress: number = 0;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error' = 'idle';
  uploadMessage: string = '';

  onFileSelected(event: any) {
    console.log('File selection event triggered');
    const file = event.target.files[0];
    if (file) {
      console.log(`File selected: ${file.name}`);
      this.uploadFile(file);
    } else {
      console.log('No file selected');
    }
  }

  uploadFile(file: File) {
    console.log(`Starting upload for file: ${file.name}`);
    this.uploadStatus = 'uploading';
    this.uploadProgress = 0;
    this.uploadMessage = 'Uploading file...';

    const formData = new FormData();
    formData.append('file', file);

    this.http.post('http://127.0.0.1:8080/upload', formData, {
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total) {
            this.uploadProgress = Math.round((100 * event.loaded) / event.total);
            console.log(`Upload progress: ${this.uploadProgress}%`);
          }
        } else if (event.type === HttpEventType.Response) {
          console.log('Upload complete. Server response:', event.body);
          this.uploadStatus = 'success';
          this.uploadMessage = 'File uploaded successfully!';
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Upload failed:', error);
        this.uploadStatus = 'error';
        this.uploadMessage = `Upload failed: ${error.message}`;
      },
      complete: () => {
        console.log('Upload operation completed');
      }
    });
  }
  







   
  
  async onStartWorkflow(event: any) {
    try {
      const response: any = await lastValueFrom(this.http.get('http://localhost:8080/fetch-main-file'));
      this.backendSourceCodeContent = response.file_contents;
      console.log('Main.py content stored:', this.backendSourceCodeContent);

      await this.generateRequirementDoc(this.backendSourceCodeContent);
    } catch (error) {
      console.error("Error in workflow:", error);
    }
  }
  
  async fetchMainFile(): Promise<string> {
    try {
      const response: any = await lastValueFrom(this.http.get('http://localhost:8080/fetch-main-file'));
      this.backendSourceCodeContent = response.result;
      console.log('Main.py contents:', response.file_contents);
      return response.file_contents;
    } catch (error) {
      console.error('Error fetching main.py contents:', error);
      throw error;
    }
  }

  async generateRequirementDoc(fileContents: string) {
    this.steps[0].status = 'Running';
    const instruction = this.generateReqDocForm.get('generateReqDocInst')?.value || 
      "Generate the requirement document for an existing movie-review application, code for which is given below. Provide the requirement document in word format.";
    
    let body = {
      input: instruction + '\n\nInput: ' + fileContents + '\n\nOutput:',
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

    try {
      await this.askWatson(body, 'reverseEngineering');
      this.steps[0].status = 'Completed';
      this.steps[1].status = '';
      // Call getUserStories after generating requirement doc
      // await this.getUserStories();
    } catch (error) {
      console.error("Error in generateRequirementDoc:", error);
      this.steps[0].status = 'error';
      // Handle error in UI
    }
  }

  async askWatson(body: any, tab: 'reverseEngineering' | 'planning'): Promise<void> {
    this.loadingVisible = true;
    this.generateRequirementDocResultsVisible = false;
    this.state = InlineLoadingState.Active;

    try {
      const result = await lastValueFrom(this.service.askWatson(JSON.stringify(body)));
      
      // Add validation check for result structure
      if (!result || !result.results || !result.results[0]) {
        throw new Error('Invalid response structure from Watson API');
      }

      this.generateRequirementDocResultsVisible = true;
      this.loadingVisible = false;
      this.state = InlineLoadingState.Hidden;
      
      let tunedOutput = result.results[0].generated_text;
      if (tunedOutput.endsWith("Input:")) {
        tunedOutput = tunedOutput.replace(/Input:([^_]*)$/, '$1');
      }
      
      if (tab === 'reverseEngineering') {
        this.generateRequirementDoc_response.setValue(tunedOutput);
      }
      this.steps[1].status = 'Completed';
      
      // if (this.downloadAllOutputs) {
      //   this.download();
      // }
    } catch (error: any) {
      console.error("Error in askWatson:", error);
      this.loadingVisible = false;
      this.state = InlineLoadingState.Error;
      this.steps[1].status = 'error';
      
      // Improved error handling
      const errorMessage = error.error?.text || error.message || 'Unknown error occurred';
      this.generateRequirementDoc_response.setValue(`Error: ${errorMessage}`);
      
      // Re-throw the error for upstream handling
      throw new Error(`Watson API Error: ${errorMessage}`);
    } finally {
      this.loadingVisible = false;
    }
  }

  async getUserStories() {
    console.log('Getting user stories...');
    this.steps[1].status = 'Running';
    const userStoryInput = this.userStoryPrompt || "For an existing movie review application, there is feature to add and update new movie tile along with a rating and review. Create 5-6 user stories for a new feature - Delete an existing movie tile along with its rating and review.";
    
    let body = {
      input: userStoryInput,
      model_id: "mistralai/mixtral-8x7b-instruct-v01",
      parameters: {
        min_new_tokens: 100,
        max_new_tokens: 600
      },
      project_id: this.projectId
    };

    try {
      const result = await lastValueFrom(this.service.askWatson(JSON.stringify(body)));
      console.log('User stories generated successfully');
      let tunedOutput = result.results[0].generated_text
      this.userStories_response.setValue(tunedOutput);
      this.setActiveTab('planning');
      this.steps[1].status = 'Completed';
    } catch (error: any) {
      console.error("Error generating user stories:", error);
      this.userStories_response.setValue('Error generating user stories: ' + (error.error?.errors?.[0]?.message || error.message || 'Unknown error'));
      this.steps[1].status = 'error';
    }
  }

  userStories_response = new FormControl('');

  activeTab: string = 'reverseEngineering';

  setActiveTab(tabName: string) {
    this.activeTab = tabName;
  }

  async saveRequirementDoc() {
    this.savedRequirementDoc = this.generateRequirementDoc_response.value || '';
    if (this.savedRequirementDoc) {
        console.log('Requirement document updated and saved to state.', this.savedRequirementDoc);
        this.generateRequirementDoc_response.setValue(this.savedRequirementDoc);
        this.getUserStories();

        // Download if downloadAllOutputs is true
        if (this.downloadAllOutputs) {
            this.downloadAsWord(this.savedRequirementDoc, "initial_requirement_document.docx");
        }
    } else {
        console.warn('No requirement document to save.');
    }
  }

  async saveUserStories() {
    this.savedUserStories = this.userStories_response.value || '';
    this.canSaveUserStories = false;
    this.canUpdateRequirementDoc = true;
    console.log('User stories saved to state.', this.savedUserStories);
    this.setActiveTab('updateRequirementDoc');

    // Download if downloadAllOutputs is true
    if (this.downloadAllOutputs) {
        this.downloadAsWord(this.savedUserStories, "userstories.docx");
    }

    this.updateRequirementDoc();
  }

  async updateRequirementDoc() {
    console.log('Updating requirement document...');
    this.steps[2].status = 'Running';
    this.canUpdateRequirementDoc = false;

    let body = {
      input: "Update and enhance the given movie review application requirement document by adding the given user stories.  " + "Do not add user stories in the requirement document." + 
             '\n\nInput:\nRequirement Document:\n\n' + this.generateRequirementDoc_response.value + 
             "\n\nUser stories:\n\n" + this.savedUserStories + '\n\nOutput:',
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

    try {
      const result = await lastValueFrom(this.service.askWatson(JSON.stringify(body)));
      console.log('Requirement document updated successfully', result);
      
      if (result && result.results && result.results[0] && result.results[0].generated_text) {
        let tunedOutput = result.results[0].generated_text
        if (tunedOutput.endsWith("Input:")) {
          tunedOutput = tunedOutput.replace(/Input:([^_]*)$/, '$1');
        }
        this.updateRequirementDoc_response.setValue(tunedOutput);
        this.latestUpdatedRequirementDoc = tunedOutput; // Save the latest value
        this.steps[2].status = 'Completed';
        this.steps[3].status = ''; // Enable the test case generation step
      } else {
        throw new Error('Unexpected response structure');
      }
    } catch (error: any) {
      console.error("Error updating requirement document:", error);
      let errorMessage = 'Error updating requirement document: ';
      if (error.error && error.error.errors && error.error.errors[0]) {
        errorMessage += error.error.errors[0].message;
      } else {
        errorMessage += error.message || 'Unknown error';
      }
      this.updateRequirementDoc_response.setValue(errorMessage);
      this.steps[2].status = 'Error';
    } finally {
      this.canUpdateRequirementDoc = true;
    }
  }

  updateRequirementDoc_response = new FormControl('');
  savedRequirementDoc: string = '';
  savedUserStories: string = '';
  canSaveRequirementDoc: boolean = false;
  canSaveUserStories: boolean = false;
  canUpdateRequirementDoc: boolean = false;

  // download() {
  //   const data = this.generateRequirementDoc_response.value;
  //   if (data) {
  //     // Download as Word document
  //     this.downloadAsWord(data , "");
      
  //     // Download as text file
  //     this.downloadAsText(data);
  //   }
  // }

  downloadAsWord(data: string, filename: string) {
    let children = [];
    let splitData = data.split('<br /><br />');
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
      saveAs(buffer, filename);
    });
  }

  downloadAsText(data: string) {
    // Remove HTML tags if present
    const plainText = data.replace(/<[^>]*>/g, '');
    
    // Create a Blob with the content
    const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
    
    // Use file-saver to save and download the file
    saveAs(blob, 'generated_requirement_doc.txt');
  }

  latestUpdatedRequirementDoc: string = '';
  

  onUpdateRequirementDocChange() {
    this.latestUpdatedRequirementDoc = this.updateRequirementDoc_response.value || '';
    console.log('Requirement document updated and saved to state.', this.latestUpdatedRequirementDoc);

    // Download if downloadAllOutputs is true
    if (this.downloadAllOutputs) {
        this.downloadAsWord(this.latestUpdatedRequirementDoc, "final_requirementdoc.docx");
    }

    this.generateTestCases();
  }

  generateTestCase_response = new FormControl('');
  savedTestCases: string = '';
  canSaveTestCases: boolean = false;

  async generateTestCases() {
    console.log('Generating test cases...');
    this.steps[3].status = 'Running';
    const dummyPrompt = "Generate functional test-cases for the given requirement document.";

    let body = {
      input: dummyPrompt + '\n\nInput:' + this.latestUpdatedRequirementDoc + '\n\nOutput:',
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

    try {
      const result = await lastValueFrom(this.service.askWatson(JSON.stringify(body)));
      console.log('Test cases generated successfully', result);
      
      if (result && result.results && result.results[0] && result.results[0].generated_text) {
        let tunedOutput = result.results[0].generated_text;
        if (tunedOutput.endsWith("Input:")) {
          tunedOutput = tunedOutput.replace(/Input:([^_]*)$/, '$1');
        }
        this.generateTestCase_response.setValue(tunedOutput);
        this.steps[3].status = 'Completed';
        this.setActiveTab('design');
        this.canSaveTestCases = true;
      } else {
        throw new Error('Unexpected response structure');
      }
    } catch (error: any) {
      console.error("Error generating test cases:", error);
      this.generateTestCase_response.setValue('Error generating test cases: ' + (error.message || 'Unknown error'));
      this.steps[3].status = 'Error';
    }
  }

  async saveTestCases() {
    this.savedTestCases = this.generateTestCase_response.value || '';
    if (this.savedTestCases) {
        console.log('Test cases saved to state:', this.savedTestCases);
        this.canSaveTestCases = false;

        // Download if downloadAllOutputs is true
        if (this.downloadAllOutputs) {
            this.downloadAsWord(this.savedTestCases, "testcases.docx");
        }

        // Generate LLD and SD documents
        await this.generateLLDDoc();
        await this.generateSDDoc();

        // Switch to the design tab
        this.setActiveTab('design');
    } else {
        console.warn('No test cases to save.');
    }
  }

  async generateLLDDoc() {
    console.log('Generating LLD document...');
    this.steps[4].status = 'Running';
    const lldPrompt = "Generate low level design document for the provided requirement document.";

    let body = {
      input: lldPrompt + '\n\nInput:' + this.latestUpdatedRequirementDoc + '\n\nOutput:',
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

    try {
      const result = await lastValueFrom(this.service.askWatson(JSON.stringify(body)));
      console.log('LLD document generated successfully', result);
      
      if (result && result.results && result.results[0] && result.results[0].generated_text) {
        let tunedOutput = result.results[0].generated_text;
        this.generateLLDDoc_response.setValue(tunedOutput);
        
      } else {
        throw new Error('Unexpected response structure');
      }
    } catch (error: any) {
      console.error("Error generating LLD document:", error);
      this.generateLLDDoc_response.setValue('Error generating LLD document: ' + (error.message || 'Unknown error'));
    }
  }

  async generateSDDoc() {
    console.log('Generating sequence diagram...');
    const sdPrompt = "Generate a plantUML code for sequence diagram, for the functional requirements from the given requirement document";

    let body = {
      input: sdPrompt + '\n\nInput:' + this.latestUpdatedRequirementDoc + '\n\nOutput:',
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

    try {
      const result = await lastValueFrom(this.service.askWatson(JSON.stringify(body)));
      console.log('Sequence diagram generated successfully', result);
      
      if (result && result.results && result.results[0] && result.results[0].generated_text) {
        let plantUMLCode = result.results[0].generated_text;
        this.generateSDDoc_response.setValue(plantUMLCode);
        await this.createImageFromBlob(plantUMLCode);
        this.steps[4].status = 'Completed';
      } else {
        throw new Error('Unexpected response structure');
      }
    } catch (error: any) {
      console.error("Error generating sequence diagram:", error);
      this.generateSDDoc_response.setValue('Error generating sequence diagram: ' + (error.message || 'Unknown error'));
      this.steps[4].status = 'Error';
    }
  }

  async createImageFromBlob(plantUMLCode: string) {
    try {
      const imageBlob = await lastValueFrom(this.service.getDiagram(plantUMLCode));
      let reader = new FileReader();
      reader.onloadend = () => {
        this.diagramImg = reader.result;
      }
      if (imageBlob) {
        reader.readAsDataURL(imageBlob);
      }
    } catch (error) {
      console.error("Error creating image from blob:", error);
    }
  }

  async saveDesignDocuments() {
    this.savedLLDDoc = this.generateLLDDoc_response.value || '';
    this.savedDiagramImg = this.diagramImg;
    if (this.savedLLDDoc && this.savedDiagramImg) {
      console.log('Design documents saved to state');
       await this.fetchIndexFile();
       await this.generateFcode();
      this.setActiveTab('frontend');
    } else {
      console.warn('No design documents to save.');
    }
  }

 
  async fetchIndexFile() {
    try {
      const response: any = await this.http.get('http://127.0.0.1:8080/fetch-index-file').toPromise();
      
      // Access the file_contents property that you returned in the JSON
      if (response && response.file_contents) {
        this.frontendSourceCodeContent = response.file_contents;
        // this.generateFcode_response.setValue(this.frontendSourceCodeContent);
        console.log('Index file fetched successfully', this.frontendSourceCodeContent);
      } else {
        console.error('Unexpected response format:', response);
      }
    } catch (error) {
      console.error('Error fetching index file:', error);
    }
  }
  
  

  // async fetchMainFile(): Promise<string> {
  //   try {
  //     const response: any = await lastValueFrom(this.http.get('http://localhost:8080/fetch-main-file'));
  //     console.log('Main.py contents:', response.file_contents);
  //     return response.file_contents;
  //   } catch (error) {
  //     console.error('Error fetching main.py contents:', error);
  //     throw error;
  //   }
  // }

  async generateFcode() {
    console.log('Generating frontend code...');
    this.steps[5].status = 'Running';

    const fcodeGenInst = "For an existing movie review application, update the given front end code index.html. Generate code for adding a 'Delete' button. Consider the User Interface Design from the given Low level design document.";

    let body = {
      input: fcodeGenInst + '\n\nInput:\n' + '\n' + this.frontendSourceCodeContent + 
             '\n\nLow level design Document:\n' + this.savedLLDDoc + '\n\nOutput:',
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

    try {
      const result = await lastValueFrom(this.service.askWatson(JSON.stringify(body)));
      console.log('Frontend code generated successfully', result);
      
      if (result && result.results && result.results[0] && result.results[0].generated_text) {
        let generatedCode = result.results[0].generated_text;
        this.generateFcode_response.setValue(generatedCode);
        // this.steps[5].status = 'Completed';
      } else {
        throw new Error('Unexpected response structure');
      }
    } catch (error: any) {
      console.error("Error generating frontend code:", error);
      this.generateFcode_response.setValue('Error generating frontend code: ' + (error.message || 'Unknown error'));
      this.steps[5].status = 'Error';
    }
  }

  async saveFrontendCode() {
    this.savedFrontendCode = this.generateFcode_response.value || '';
    if (this.savedFrontendCode) {
        console.log('Frontend code saved to state');
        try {
            // Save frontend code to server
            await this.http.post('http://127.0.0.1:8080/update_index_file', { content: this.savedFrontendCode }).toPromise();
            console.log('Frontend code updated successfully');

            // Download if downloadAllOutputs is true
            if (this.downloadAllOutputs) {
                this.downloadAsWord(this.savedFrontendCode, "index.html");
            }

            // Generate backend code
            await this.generateBcode();
        } catch (error) {
            console.error('Error in saveFrontendCode:', error);
        }
    } else {
        console.warn('No frontend code to save.');
    }
  }

  async generateBcode() {
    console.log('Generating backend code...');
    this.steps[5].status = 'Running';

    const bcodeGenInst = "For an existing movie review application's front end index.html is provided to delete a movie tile. Update the main.py given with method for deleting a movie tile Follow the python syntax and indentation when generating python code.";
    

    let body = {
      input: bcodeGenInst + '\n\nInput:\n' + this.frontendSourceCodeBackendFileName + '\n' + this.savedFrontendCode + 
             '\n\nExisting Backend Code main.py :\n' + this.backendSourceCodeContent + '\n\nOutput:',
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

    console.log("Using stored backendSourceCodeContent:", body.input);

    try {
      const result = await lastValueFrom(this.service.askWatson(JSON.stringify(body)));
      console.log('Backend code generated successfully', result);
      
      if (result && result.results && result.results[0] && result.results[0].generated_text) {
        let generatedCode = result.results[0].generated_text;
        this.generateBcode_response.setValue(generatedCode);
        this.steps[5].status = 'Completed';
        this.setActiveTab('backend');
      } else {
        throw new Error('Unexpected response structure');
      }
    } catch (error: any) {
      console.error("Error generating backend code:", error);
      this.generateBcode_response.setValue('Error generating backend code: ' + (error.message || 'Unknown error'));
      this.steps[5].status = 'Error';
    }
  }

  async saveBackendCode() {
    const backendCode = this.generateBcode_response.value || '';
    if (backendCode) {
        try {
            // Save backend code to server
            await this.http.post('http://127.0.0.1:8080/update_main_file', { content: backendCode }).toPromise();
            console.log('Backend code updated successfully');

            // Download if downloadAllOutputs is true
            if (this.downloadAllOutputs) {
                this.downloadAsWord(backendCode, "main.py");
            }

            // Start Jenkins config generation
            await this.generateJenkinsConfig();
        } catch (error) {
            console.error('Error in saveBackendCode:', error);
        }
    }
  }
 jenkinsConfigJobExample:string = "Input: Generate Jenkins job configuration file for the project test-project with GitHub URL https://github.com/akshay-eng/fav-movies.git  and imagename as test-project\nOutput: <?xml version='1.1' encoding='UTF-8'?>\n<flow-definition plugin=\"workflow-job@1400.v7fd111b_ec82f\">\n  <actions/>\n  <description></description>\n  <keepDependencies>false</keepDependencies>\n  <properties>\n    <hudson.model.ParametersDefinitionProperty>\n      <parameterDefinitions>\n        <hudson.model.StringParameterDefinition>\n          <name>container_registry_url</name>\n          <defaultValue>index.docker.io</defaultValue>\n          <trim>false</trim>\n        </hudson.model.StringParameterDefinition>\n        <hudson.model.StringParameterDefinition>\n          <name>registry_namespace</name>\n          <defaultValue>wiprodigiexpert</defaultValue>\n          <trim>false</trim>\n        </hudson.model.StringParameterDefinition>\n        <hudson.model.StringParameterDefinition>\n          <name>imagename</name>\n          <defaultValue>test-project</defaultValue>\n          <trim>false</trim>\n        </hudson.model.StringParameterDefinition>\n        <hudson.model.PasswordParameterDefinition>\n          <name>IBM_CLOUD_API_KEY</name>\n          <defaultValue>ibm_cloud_api_key_value</defaultValue>\n        </hudson.model.PasswordParameterDefinition>\n        <hudson.model.StringParameterDefinition>\n          <name>OCP_API_URL</name>\n          <defaultValue>ocp_api_url_value</defaultValue>\n          <trim>false</trim>\n        </hudson.model.StringParameterDefinition>\n        <hudson.model.StringParameterDefinition>\n          <name>Namespace</name>\n          <defaultValue>demo</defaultValue>\n          <trim>false</trim>\n        </hudson.model.StringParameterDefinition>\n      </parameterDefinitions>\n    </hudson.model.ParametersDefinitionProperty>\n  </properties>\n  <definition class=\"org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition\" plugin=\"workflow-cps@3883.vb_3ff2a_e3eea_f\">\n    <scm class=\"hudson.plugins.git.GitSCM\" plugin=\"git@5.2.1\">\n      <configVersion>2</configVersion>\n      <userRemoteConfigs>\n        <hudson.plugins.git.UserRemoteConfig>\n          <url>https://github.ibm.com/automation-squad/test-project.git</url>\n          <credentialsId>github.ibm.com</credentialsId>\n        </hudson.plugins.git.UserRemoteConfig>\n      </userRemoteConfigs>\n      <branches>\n        <hudson.plugins.git.BranchSpec>\n          <name>*/main</name>\n        </hudson.plugins.git.BranchSpec>\n      </branches>\n      <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>\n      <submoduleCfg class=\"empty-list\"/>\n      <extensions/>\n    </scm>\n    <scriptPath>devops/jenkinsfile</scriptPath>\n    <lightweight>true</lightweight>\n  </definition>\n  <triggers/>\n  <disabled>false</disabled>\n</flow-definition>";
  // Jenkins Config Generation
  async generateJenkinsConfig() {
    console.log('Generating Jenkins config...');
    this.steps[6].status = 'Running';

    const jenkinsConfigJobInput = "Generate Jenkins job configuration file for the project fav-movies with GitHub URL https://github.com/akshay-eng/fav-movies.git and imagename as fav-movies.";

    let body = {
  input: this.jenkinsConfigJobExample + '\n\nInput:' + jenkinsConfigJobInput + '\\nOutput:',
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
    console.log("jenkins config",body.input)
    try {
     
      const result = await lastValueFrom(this.service.askWatson(JSON.stringify(body)));
      if (result?.results?.[0]?.generated_text) {
        this.generateJenkinsConfig_response.setValue(result.results[0].generated_text);
      }
    } catch (error) {
      console.error('Error generating Jenkins config:', error);
      this.steps[6].status = 'Error';
    }
  }

  // Save Jenkins Config and trigger Jenkinsfile generation
  async saveJenkinsConfig() {
    this.savedJenkinsConfig = this.generateJenkinsConfig_response.value || '';
    if (this.savedJenkinsConfig) {
        console.log('Jenkins config saved to state:', this.savedJenkinsConfig);
        try {
            // Save Jenkins config to server
            await this.http.post('http://127.0.0.1:8080/update_jenkins_config', { content: this.savedJenkinsConfig }).toPromise();
            console.log('Jenkins config updated successfully');

            // Download if downloadAllOutputs is true
            if (this.downloadAllOutputs) {
                this.downloadAsWord(this.savedJenkinsConfig, "jenkinsconfig.docx");
            }

            // Call generateJenkinsfile after saving Jenkins config
            await this.generateJenkinsfile();
        } catch (error) {
            console.error('Error saving Jenkins config:', error);
        }
    } else {
        console.warn('No Jenkins config to save.');
    }
  }
  placeholderJenkinsGenInst: any = "Generate Jenkins file for given input.\n\nInput: Create Jenkins file to build watsonx-prompter application'\''s docker image using docker file in the path devops/Dockerfile. The application has to be deployed in OpenShift cluster on IBM Cloud. The application code is in the GitHub repository https://github.ibm.com/automation-squad/watsonx-prompter.git. Use github.ibm.com as credentialsId.\nOutput: timestamps {\n    node () {\n        wrap([$class: '\''Xvfb'\'']) {\n            stage ('\''watsonx-prompter - Checkout'\'') {\n                checkout([$class: '\''GitSCM'\'', branches: [[name: '\''*/main'\'']], doGenerateSubmoduleConfigurations: false, extensions: [], submoduleCfg: [], userRemoteConfigs: [[credentialsId: '\''github.ibm.com'\'', url: '\''https://github.ibm.com/automation-squad/watsonx-prompter.git'\'']]])\n            }\n            stage ('\''watsonx-prompter - Build & Deployment'\'') {\n\n                sh \"docker login ${container_registry_url}\"\n                sh \"docker build -t ${imagename}:${BUILD_NUMBER} -f devops/Dockerfile .\"\n                sh \"docker tag ${imagename}:${BUILD_NUMBER} ${container_registry_url}/${registry_namespace}/${imagename}:${BUILD_NUMBER}\"\n                sh \"docker tag ${imagename}:${BUILD_NUMBER} ${container_registry_url}/${registry_namespace}/${imagename}:latest\"\n                sh \"docker push ${container_registry_url}/${registry_namespace}/${imagename}:${BUILD_NUMBER}\"\n                sh \"docker push ${container_registry_url}/${registry_namespace}/${imagename}:latest\"\n\n                // Deploy application\n                sh \"ibmcloud login --apikey ${IBM_CLOUD_API_KEY} -r '\''us-south'\'' -g Default\"\n                sh \"oc login ${OCP_API_URL} -u apikey -p ${IBM_CLOUD_API_KEY}\"\n\n                sh \"oc project ${Namespace}\"\n                sh \"oc apply -f devops/\"\n                sh \"oc get route -n ${Namespace}\"\n\n            }\n        }\n        cleanWs()\n    }\n}";
  // Jenkinsfile Generation
  async generateJenkinsfile() {
    console.log('Generating Jenkinsfile...');
    
    const jenkinsGenInput = "Create Jenkins file to build fav-movies application's docker image using docker file in the path devops/Dockerfile. The application has to be deployed in Kubernetes cluster . The application code is in the GitHub repository https://github.com/akshay-eng/fav-movies.git";

    let body = {
      input: this.placeholderJenkinsGenInst + '\n\nInput:' + jenkinsGenInput + '\nOutput:',
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

    try {
      const result = await lastValueFrom(this.service.askWatson(JSON.stringify(body)));
      if (result?.results?.[0]?.generated_text) {
        this.generateJenkinsFile_response.setValue(result.results[0].generated_text);
      }
    } catch (error) {
      console.error('Error generating Jenkinsfile:', error);
    }
  }

  // Save Jenkinsfile and trigger Dockerfile generation
  async saveJenkinsfile() {
    this.savedJenkinsFile = this.generateJenkinsFile_response.value || '';
    if (this.savedJenkinsFile) {
        console.log('Jenkinsfile saved to state:', this.savedJenkinsFile);
        try {
            // Save Jenkinsfile to server
            await this.http.post('http://127.0.0.1:8080/update_jenkinsfile', { content: this.savedJenkinsFile }).toPromise();
            console.log('Jenkinsfile updated successfully');

            // Download if downloadAllOutputs is true
            if (this.downloadAllOutputs) {
                this.downloadAsWord(this.savedJenkinsFile, "jenkinsfile.docx");
            }

            await this.generateDockerfile();
        } catch (error) {
            console.error('Error saving Jenkinsfile:', error);
        }
    } else {
        console.warn('No Jenkinsfile to save.');
    }
  }
  placeholderDockerGenInst: any = "Generate a docker file for running a python application watsonx-prompter.py on port 8080 which uses following environment variables: PROJECT_ID, API_KEY and WATSONX_URL. The application should run as a non-root user, namely favuser.\nOutput: FROM python:3.11-slim\nLABEL maintainer=\"EESI Lab - Automation Squad\"\nRUN groupadd -r favuser && useradd -r -g favuser favuser\nENV PROJECT_ID=\"\" \\\n    API_KEY=\"\" \\\n    WATSONX_URL=\"\"\n\nRUN mkdir app\nWORKDIR /app\n\n# Copy requirements.txt and install dependencies\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\n# Copy the application files\nCOPY . .\n\n# Set ownership of the application directory to the non-root user\nRUN chmod -R 777 .\nRUN chown -R favuser:favuser .\n\n# Switch to the non-root user\nUSER favuser\n\nEXPOSE 8080\n\nCMD [\"python\", \"watsonx-prompter.py\"]";
  // Dockerfile Generation
  async generateDockerfile() {
    console.log('Generating Dockerfile...');
    
    const dockerGenInput = "Generate a docker file for running a python application main.py on port 8080 which uses following environment variables: API_KEY. The application should run as a non-root user, namely favuser.";

    let body = {
      input: this.placeholderDockerGenInst + '\n\nInput:' + dockerGenInput + '\n\nOutput:',
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

    try {
      const result = await lastValueFrom(this.service.askWatson(JSON.stringify(body)));
      if (result?.results?.[0]?.generated_text) {
        this.generateDockerfile_response.setValue(result.results[0].generated_text);
      }
    } catch (error) {
      console.error('Error generating Dockerfile:', error);
    }
  }
  downloadFavMovies() {
    const url = 'http://127.0.0.1:8080/download-fav-movies';

    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (response: Blob) => {
        const blob = new Blob([response], { type: 'application/zip' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fav-movies-main.zip'; // Specify the filename
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Download failed:', error);
      }
    });
  }
  // Save Dockerfile and trigger OCP config generation
  async saveDockerfile() {
    this.savedDockerfile = this.generateDockerfile_response.value || '';
    if (this.savedDockerfile) {
        console.log('Dockerfile saved to state:', this.savedDockerfile);
        try {
            // Save Dockerfile to server
            await this.http.post('http://127.0.0.1:8080/update_dockerfile', { content: this.savedDockerfile }).toPromise();
            console.log('Dockerfile updated successfully');

            // Download if downloadAllOutputs is true
            if (this.downloadAllOutputs) {
                this.downloadAsWord(this.savedDockerfile, "dockerfile.docx");
            }

            await this.generateOCPConfig();
        } catch (error) {
            console.error('Error saving Dockerfile:', error);
        }
    } else {
        console.warn('No Dockerfile to save.');
    }
  }
  placeholderOCPConfigGenInst: any = " Create yaml files to deploy the watsonx-prompter application on OpenShift in demo namespace and expose the route with TLS termination at edge. The application container image is available at quay.io/eesilab/watsonx-prompter:latest with container port as 8080. It accepts following environment variables: PROJECT_ID, API_KEY and WATSONX_URL.\nOutput: apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: watsonx-prompter-deployment\n  namespace: demo\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: watsonx-prompter\n  template:\n    metadata:\n      labels:\n        app: watsonx-prompter\n    spec:\n      containers:\n      - name: watsonx-prompter-container\n        image: quay.io/eesilab/watsonx-prompter:latest\n        imagePullPolicy: Always\n        ports:\n        - containerPort: 8080\n        env:\n          - name: PROJECT_ID\n            value: \"ebc65ffd-b66f-4c10-b901-894ce0c61053\"\n          - name: API_KEY\n            value: \"efDjoR-XVp1Ji-O7lRMUapTpzTVRmYyElf_gL1aK4m6_\"\n          - name: WATSONX_URL\n            value: \"https://us-south.ml.cloud.ibm.com/ml/v1-beta/generation/text?version=2023-05-29\"\n        securityContext:\n          allowPrivilegeEscalation: false\n          runAsNonRoot: true\n          seccompProfile:\n            type: RuntimeDefault\n          capabilities:\n            drop:\n              - ALL\n\n---\napiVersion: v1\nkind: Service\nmetadata:\n  name: watsonx-prompter-svc\n  namespace: demo\nspec:\n  ports:\n  - port: 8080\n    protocol: TCP\n    targetPort: 8080\n  selector:\n    app: watsonx-prompter\n  type: ClusterIP\n\n---\napiVersion: route.openshift.io/v1\nkind: Route\nmetadata:\n  name: watsonx-prompter-route\n  namespace: demo\nspec:\n  port:\n    targetPort: 8080\n  tls:\n    insecureEdgeTerminationPolicy: Allow\n    termination: edge\n  to:\n    kind: Service\n    name: watsonx-prompter-svc\n    weight: 100\n  wildcardPolicy: None";
  // OCP Config Generation
  async generateOCPConfig() {
    console.log('Generating OCP config...');
    
    const ocpConfigGenInput = "Create yaml files to deploy the fav-movies application on Kubernetes in demo namespace and expose the ingress  . The application container image is available at index.docker.io/wiprodigiexpert/fav-movies:latest with container port as 8080. It accepts following environment variables: API_KEY with value <api_key_value>.Add securityContext to the container with no runAsNonRoot configuration.";

    let body = {
      input: this.placeholderOCPConfigGenInst + '\n\nInput:\n' + ocpConfigGenInput + '\n\nOutput:',
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

    try {
      const result = await lastValueFrom(this.service.askWatson(JSON.stringify(body)));
      if (result?.results?.[0]?.generated_text) {
        this.generateOCPConfig_response.setValue(result.results[0].generated_text);
        this.steps[6].status = 'Completed';
      }
    } catch (error) {
      console.error('Error generating OCP config:', error);
      this.steps[6].status = 'Error';
    }
  }

  // Save OCP config
  async saveOCPConfig() {
    this.savedOCPConfig = this.generateOCPConfig_response.value || '';
    if (this.savedOCPConfig) {
        console.log('OCP config saved to state:', this.savedOCPConfig);
        try {
            // Save OCP config to server
            await this.http.post('http://127.0.0.1:8080/update_ocp_config', { content: this.savedOCPConfig }).toPromise();
            console.log('OCP config updated successfully');

            // Download if downloadAllOutputs is true
            if (this.downloadAllOutputs) {
                this.downloadAsWord(this.savedOCPConfig, "movies.docx");
            }
        } catch (error) {
            console.error('Error saving OCP config:', error);
        }
    } else {
        console.warn('No OCP config to save.');
    }
  }

  xmlText = "" 
  isActive = false;
  normal = "normal";
  overlay = true;
  createConfigJob(name: string) {
    console.log(name, this.savedJenkinsConfig)
      // Convert savedJenkinsConfig (string) to an XML document
  

  

    this.loadingVisible = true
    this.isActive = true;
    this.overlay = true;
    this.service.createJenkinsJob(this.savedJenkinsConfig, name).subscribe({
      next: (value) => {
      //   this.notificationObj = {
      //     type: 'success',
      //     title: 'Job creation success',
      //     subtitle: 'Jenkins Job was created successfully',
      //     caption: '',
      //     showClose: true
      // }
      this.loadingVisible = false;
      // this.notificationShow =true
      this.isActive = false;
      this.overlay = false;
      // this.showNextStage = true
      },
      error: (err) => {
      //   this.notificationObj = {
      //     type: 'error',
      //     title: 'Job creation failed',
      //     subtitle: 'Something went wrong.',
      //     caption: '',
      //     showClose: true
      // }
        this.loadingVisible = false;
        this.isActive = false;
        this.overlay = false;
        // this.notificationShow =true
        console.error('Observable emitted an error: ' + err)
      },
      complete: () => {
        console.log('Observable emitted the complete notification')
        this.loadingVisible = false;
        // this.notificationShow =true
      }
  })
  }

  getLatestXML(config:string){
    this.savedJenkinsConfig = config
  }

}
