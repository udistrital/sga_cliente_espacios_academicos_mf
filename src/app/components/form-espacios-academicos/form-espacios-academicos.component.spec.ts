import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormEspaciosAcademicosComponent } from './form-espacios-academicos.component';

describe('FormEspaciosAcademicosComponent', () => {
  let component: FormEspaciosAcademicosComponent;
  let fixture: ComponentFixture<FormEspaciosAcademicosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormEspaciosAcademicosComponent]
    });
    fixture = TestBed.createComponent(FormEspaciosAcademicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
