import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgrupacionEspaciosAcademicosComponent } from './agrupacion-espacios-academicos.component';

describe('AgrupacionEspaciosAcademicosComponent', () => {
  let component: AgrupacionEspaciosAcademicosComponent;
  let fixture: ComponentFixture<AgrupacionEspaciosAcademicosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AgrupacionEspaciosAcademicosComponent]
    });
    fixture = TestBed.createComponent(AgrupacionEspaciosAcademicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
