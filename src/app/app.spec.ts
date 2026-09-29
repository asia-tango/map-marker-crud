import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { MarkersPage } from './markers/markers-page/markers-page';

@Component({
  selector: 'app-markers-page',
  template: '',
})
class MarkersPageStub {}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    })
      .overrideComponent(App, {
        remove: { imports: [MarkersPage] },
        add: { imports: [MarkersPageStub] },
      })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
