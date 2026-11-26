import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { RequestManager } from '../managers/requestManager';

const httpOptions = {
  headers: new HttpHeaders({
    Accept: 'application/json',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class DocumentoService {
  constructor(private readonly requestManager: RequestManager) {
    this.requestManager.setPath('DOCUMENTO_SERVICE');
  }
  get(endpoint: string) {
    this.requestManager.setPath('DOCUMENTO_SERVICE');
    return this.requestManager.get(endpoint);
  }
  post(endpoint: string, element: any) {
    this.requestManager.setPath('DOCUMENTO_SERVICE');
    return this.requestManager.post(endpoint, element);
  }
  put(endpoint: string, element: any) {
    this.requestManager.setPath('DOCUMENTO_SERVICE');
    return this.requestManager.put(endpoint, element);
  }
  delete(endpoint: string, element: any) {
    this.requestManager.setPath('DOCUMENTO_SERVICE');
    return this.requestManager.delete(endpoint, element.Id);
  }
}
