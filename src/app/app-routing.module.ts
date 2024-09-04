import { NgModule } from '@angular/core';
import { RouterModule, Routes, provideRouter } from '@angular/router';
import { getSingleSpaExtraProviders } from 'single-spa-angular';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';
import { ListEspaciosAcademicosComponent } from './modules/list-espacios-academicos/list-espacios-academicos.component';
import { AgrupacionEspaciosAcademicosComponent } from './modules/list-espacios-academicos/components/agrupacion-espacios-academicos/agrupacion-espacios-academicos.component';
import { FormEspaciosAcademicosComponent } from './modules/list-espacios-academicos/components/form-espacios-academicos/form-espacios-academicos.component';
import { VerEspaciosHijosComponent } from './modules/list-espacios-academicos/components/ver-espacios-hijos/ver-espacios-hijos.component';

const routes: Routes = [
  {
    path: '',
    component: ListEspaciosAcademicosComponent,
  },
  {
    path: 'formulario/:accion/:elemento',
    component: FormEspaciosAcademicosComponent,
  },
  {
    path: 'agrupacion-espacios/:facultad_id',
    component: AgrupacionEspaciosAcademicosComponent,
  },
  {
    path: 'grupos/:espacio-academico-id',
    component: VerEspaciosHijosComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    provideRouter(routes),
    { provide: APP_BASE_HREF, useValue: '/espacios-academicos/' },
    getSingleSpaExtraProviders(),
    provideHttpClient(withFetch()),
  ],
})
export class AppRoutingModule {}
