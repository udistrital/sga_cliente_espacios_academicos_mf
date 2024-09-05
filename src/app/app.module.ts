import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatListModule } from '@angular/material/list';
import { EspaciosAcademicosService } from './services/espacios_academicos.service';
import { SpinnerUtilInterceptor, SpinnerUtilModule } from 'spinner-util';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { AgrupacionEspaciosAcademicosComponent } from './modules/list-espacios-academicos/components/agrupacion-espacios-academicos/agrupacion-espacios-academicos.component';
import { FormEspaciosAcademicosComponent } from './modules/list-espacios-academicos/components/form-espacios-academicos/form-espacios-academicos.component';
import { ListEspaciosAcademicosComponent } from './modules/list-espacios-academicos/list-espacios-academicos.component';
import { DialogoEditarEspacioComponent } from './modules/list-espacios-academicos/components/ver-espacios-hijos/components/dialogo-editar-espacio/dialogo-editar-espacio.component';
import { VerEspaciosHijosComponent } from './modules/list-espacios-academicos/components/ver-espacios-hijos/ver-espacios-hijos.component';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(
    http,
    environment.apiUrl + 'assets/i18n/',
    '.json'
  );
}

@NgModule({
  declarations: [
    AppComponent,
    ListEspaciosAcademicosComponent,
    FormEspaciosAcademicosComponent,
    AgrupacionEspaciosAcademicosComponent,
    VerEspaciosHijosComponent,
    DialogoEditarEspacioComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    SpinnerUtilModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    EspaciosAcademicosService,
    MatSnackBar,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SpinnerUtilInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
