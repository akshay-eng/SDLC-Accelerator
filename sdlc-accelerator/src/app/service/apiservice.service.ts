import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { CacheServiceService } from './cache-service.service';
import { BehaviorSubject, Observable, Subscription, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class APIServiceService implements OnInit{

  cacheSubscription: Subscription | undefined;
  TOKEN_URL = "/identity/token";
  ASK_WATSON_URL_OLD = "/ml/v1-beta/generation/text?version=2023-05-29";
  ASK_WATSON_URL = "/watsonx_proxy"; // add the local urls in front of the path while running it locally 
  EXTRACT_TEXT_URL="/extracttext";
  JENKINS_URL= "/createItem?name="
  JENKINS_USERNAME= environment.JENKINS_USERNAME;
  JENKINS_PASSWORD= environment.JENKINS_PASSWORD;
  TOKEN: any;

  httpTokenOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    })
  };
  
  private cache$!: string;
  
  constructor(private httpClient: HttpClient, private cacheService: CacheServiceService) { }

  ngOnInit(): void { 
  }

  askWatson_old(token: string, body: any) :Observable<any> {
    let headers = { "Content-Type" : "application/json", "Accept":"application/json", "Authorization":"Bearer "+token};
    let httpOptions = { headers:  headers };
    let data    ="{\"model_id\":\"ibm-mistralai/mixtral-8x7b-instruct-v01-q\",\"input\":\"GenerateKubernetesyamlfiles\\n\\n\",\"parameters\":{\"decoding_method\":\"sample\",\"max_new_tokens\":4095,\"min_new_tokens\":0,\"stop_sequences\":[\"\\n\\n\\n\",\"\\n\\nInput:\"],\"temperature\":0.7,\"top_k\":50,\"top_p\":1,\"repetition_penalty\":1},\"project_id\":\"ebc65ffd-b66f-4c10-b901-894ce0c61053\"}";  
    return this.httpClient.post<any>(this.ASK_WATSON_URL ,data, httpOptions);
    //throw new Error('Method not implemented.');
  }

  askWatson(body: any) :Observable<any> {
    let headers = { "Content-Type" : "application/json", "Accept":"application/json"};
    let httpOptions = { headers:  headers };
    return this.httpClient.post<any>(this.ASK_WATSON_URL ,body, httpOptions);
  }

  extractText(body: any): Observable<any> {
    let headers = { "Accept": "application/json" };
    let httpOptions = { headers:  headers };
    return this.httpClient.post<any>(this.EXTRACT_TEXT_URL,body, httpOptions);
  }
  
  getDiagram(data: any){
    console.log(data);
    let headers = {"Content-Type": "text/plain", 'Accept': "image/png"};
    let httpOptions = {
      headers: headers
    };
    let url = "http://127.0.0.1:8085/generateDiagram";
    let body= `
    @startuml
actor "Movie Lover" as MovieLover
participant "Movie Review Application" as App
participant "Movie Database" as Database
participant "Local SQLite db" as SQLiteDB
activate MovieLover
MovieLover -> App: Search for a movie
activate App
App -> Database: Search movie database
activate Database
Database --> App: Return search results
deactivate Database
App -> MovieLover: Display search results
deactivate App
MovieLover -> App: Select a movie
activate App
App -> SQLiteDB: Retrieve movie details
activate SQLiteDB
SQLiteDB --> App: Return movie details
deactivate SQLiteDB
App -> MovieLover: Display movie details
deactivate App
MovieLover -> App: Add movie tile with rating and review
activate App
App -> SQLiteDB: Store movie details with rating and review
activate SQLiteDB
deactivate SQLiteDB
deactivate App
MovieLover -> App: Update movie tile with new rating and review
activate App
App -> SQLiteDB: Update movie details with new rating and review
activate SQLiteDB
deactivate SQLiteDB
deactivate App
MovieLover -> App: Delete movie tile
activate App
App -> SQLiteDB: Delete movie details
activate SQLiteDB
deactivate SQLiteDB
deactivate App
@enduml
`
    return this.httpClient.post<any>(url, data, {responseType: 'blob' as 'json'});
  }

  createJenkinsJob(body:any, jobName: string):Observable<any> {
    let headers = { "Content-Type" : "application/xml", "Authorization" : 'Basic ' + btoa(unescape(encodeURIComponent(this.JENKINS_USERNAME + ':' + this.JENKINS_PASSWORD)))};
    let httpOptions = { headers:  headers };
    return this.httpClient.post<any>(this.JENKINS_URL+jobName,body, httpOptions);
  }

  ngOnDestroy(): void {
    if(this.cacheSubscription) this.cacheSubscription.unsubscribe();
    this.cacheService.clear('1'); 
  }
}
