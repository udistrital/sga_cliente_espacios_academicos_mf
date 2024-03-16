import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { RequestManager } from '../managers/requestManager';

const httpOptions = {
    headers: new HttpHeaders({
        'Accept': 'application/json',
    }),
}

const httpOptionsFile = {
    headers: new HttpHeaders({
        'Content-Type': 'multipart/form-data',
    }),
}

const path = environment.ESPACIO_ACADEMICO_MID_SERVICE;

@Injectable({
    providedIn: 'root',
})
export class EspacioAcademicoMidService {

    constructor(private requestManager: RequestManager, private http: HttpClient) {
        this.requestManager.setPath('ESPACIO_ACADEMICO_MID_SERVICE');
    }

    get(endpoint: any) {
        this.requestManager.setPath('ESPACIO_ACADEMICO_MID_SERVICE');
        return this.requestManager.get(endpoint);
    }

    post(endpoint: any, element: any) {
        this.requestManager.setPath('ESPACIO_ACADEMICO_MID_SERVICE');
        return this.requestManager.post(endpoint, element);
    }

    put(endpoint: any, element: any) {
        this.requestManager.setPath('ESPACIO_ACADEMICO_MID_SERVICE');
        return this.requestManager.put(endpoint, element);
    }

    delete(endpoint: any, element: any) {
        this.requestManager.setPath('ESPACIO_ACADEMICO_MID_SERVICE');
        return this.requestManager.delete(endpoint, element.Id);
    }

}