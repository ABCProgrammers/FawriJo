import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewUploadedFileComponent } from './view-uploaded-file.component';

describe('ViewUploadedFileComponent', () => {
  let component: ViewUploadedFileComponent;
  let fixture: ComponentFixture<ViewUploadedFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewUploadedFileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewUploadedFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
