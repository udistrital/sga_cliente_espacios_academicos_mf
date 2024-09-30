import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListEspaciosAcademicosComponent } from './list-espacios-academicos.component';

describe('ListEspaciosAcademicosComponent', () => {
  let component: ListEspaciosAcademicosComponent;
  let fixture: ComponentFixture<ListEspaciosAcademicosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListEspaciosAcademicosComponent]
    });
    fixture = TestBed.createComponent(ListEspaciosAcademicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
