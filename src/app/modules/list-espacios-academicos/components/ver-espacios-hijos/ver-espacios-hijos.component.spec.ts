import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerEspaciosHijosComponent } from './ver-espacios-hijos.component';

describe('VerEspaciosHijosComponent', () => {
  let component: VerEspaciosHijosComponent;
  let fixture: ComponentFixture<VerEspaciosHijosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VerEspaciosHijosComponent]
    });
    fixture = TestBed.createComponent(VerEspaciosHijosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
