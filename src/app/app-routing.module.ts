import { NgModule } from '@angular/core';
import { RouterModule, Routes, provideRouter } from '@angular/router';
import { getSingleSpaExtraProviders } from 'single-spa-angular';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';
import { ListEspaciosAcademicosComponent } from './components/list-espacios-academicos/list-espacios-academicos.component';
import { FormEspaciosAcademicosComponent } from './components/form-espacios-academicos/form-espacios-academicos.component';
import { AgrupacionEspaciosAcademicosComponent } from './components/agrupacion-espacios-academicos/agrupacion-espacios-academicos.component';
import { AuthGuard } from 'src/_guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: ListEspaciosAcademicosComponent,
  },
  {
    path: 'formulario/:accion/:elemento',
    canActivate: [AuthGuard],
    component: FormEspaciosAcademicosComponent,
  },
  {
    path: 'agrupacion-espacios/:facultad_id',
    canActivate: [AuthGuard],
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
