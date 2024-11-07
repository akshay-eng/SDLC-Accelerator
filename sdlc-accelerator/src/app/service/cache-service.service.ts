import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CacheServiceService {

  private cache = new Map<string, any>();
  public cache$ = new BehaviorSubject<any>(null);
  
  constructor() { }

  set(key: string, data: string): void {
    if (this.cache.has(key)) {
      throw new Error(`Data already exists for key '${key}'. Use a different key or delete the existing one first.`);
    }
    this.cache.set(key, data);
    this.cache$.next(this.cache.get(key));
  }

  get(key: string): any {
    const data = this.cache.get(key);
    this.cache$.next(data);
    return data;
  }

  clear(key: string): void {
    this.cache.delete(key);
    this.cache$.next(null);
  }
}
