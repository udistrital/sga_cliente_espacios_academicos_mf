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
import { ListEspaciosAcademicosComponent } from './components/list-espacios-academicos/list-espacios-academicos.component';
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
import { FormEspaciosAcademicosComponent } from './components/form-espacios-academicos/form-espacios-academicos.component';
import { AgrupacionEspaciosAcademicosComponent } from './components/agrupacion-espacios-academicos/agrupacion-espacios-academicos.component';
import { SpinnerUtilInterceptor, SpinnerUtilModule } from 'spinner-util';

@NgModule({
  declarations: [
    AppComponent,
    ListEspaciosAcademicosComponent,
    FormEspaciosAcademicosComponent,
    AgrupacionEspaciosAcademicosComponent
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
    TranslateModule.forRoot({
      loader:{
        provide:TranslateLoader,
        useFactory: (createTranslateLoader),
        deps:[HttpClient]
      }
    })
  ],
  providers: [
    EspaciosAcademicosService,
    MatSnackBar,
    { provide: HTTP_INTERCEPTORS, useClass: SpinnerUtilInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, 'http://localhost:4208/assets/i18n/', '.json');
}