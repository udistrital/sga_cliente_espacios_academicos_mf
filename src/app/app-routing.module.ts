import { NgModule } from '@angular/core';
import { RouterModule, Routes, provideRouter } from '@angular/router';
import { getSingleSpaExtraProviders } from 'single-spa-angular';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';
import { ListEspaciosAcademicosComponent } from './components/list-espacios-academicos/list-espacios-academicos.component';

const routes: Routes = [
  {
    path: '',
    component: ListEspaciosAcademicosComponent,
    //canActivate: [AuthGuard],
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    provideRouter(routes),
    { provide: APP_BASE_HREF, useValue: '/espacios-academicos/' },
    getSingleSpaExtraProviders(),
    provideHttpClient(withFetch()) 
  ]
})
export class AppRoutingModule { }
