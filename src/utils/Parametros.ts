import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ParametrosService } from '../app/services/parametros.service';
import { ordenarPorPropiedad } from './listas';

@Injectable({
  providedIn: 'root',
})
export class Parametros {
  constructor(private parametrosService: ParametrosService) {}

  periodos(): Observable<any[]> {
    return this.parametrosService
      .get('periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0')
      .pipe(
        map((res: any) => {
          if (res.length === 0) {
            return [];
          }
          return ordenarPorPropiedad(res.Data, 'Nombre', -1);
        }),
        catchError((error) => {
          return of([]);
        })
      );
  }
}
