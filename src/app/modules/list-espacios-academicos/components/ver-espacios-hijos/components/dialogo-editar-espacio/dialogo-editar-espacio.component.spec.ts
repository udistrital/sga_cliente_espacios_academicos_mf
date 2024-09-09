import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoEditarEspacioComponent } from './dialogo-editar-espacio.component';

describe('DialogoEditarEspacioComponent', () => {
  let component: DialogoEditarEspacioComponent;
  let fixture: ComponentFixture<DialogoEditarEspacioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogoEditarEspacioComponent]
    });
    fixture = TestBed.createComponent(DialogoEditarEspacioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
