import { Component } from '@angular/core';
import { EspacioAcademico } from 'src/app/models/espacio_academico';
import { EspaciosAcademicosService } from 'src/app/services/espacios_academicos.service';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { OnInit } from '@angular/core';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];

@Component({
  selector: 'list-espacios-academicos',
  templateUrl: './list-espacios-academicos.component.html',
  styleUrls: ['./list-espacios-academicos.component.scss']
})
export class ListEspaciosAcademicosComponent implements OnInit {
  displayedColumns: string[] = ['#', 'nombre', 'codigo', 'estado', 'gestion', 'enviar'];
  dataSource = ELEMENT_DATA;
  espacios_academicos!: EspacioAcademico[];

  constructor(private espaciosAcademicosService: EspaciosAcademicosService, private popUpManager: PopUpManager) { }

  ngOnInit() {
    this.loadEspaciosAcademicos();
  }

  loadEspaciosAcademicos() {
    this.espaciosAcademicosService.get('espacio-academico?query=espacio_academico_padre,activo:true&limit=0').subscribe(
      (response: any) => {
        this.espacios_academicos = response;
        console.log(this.espacios_academicos)
      },
      error => {
        this.popUpManager.showErrorToast("ERROR GENERAL");
      }
    );
  }
}
