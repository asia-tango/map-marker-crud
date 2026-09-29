import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { MarkerForm } from './marker-form';

describe('MarkerForm', () => {
  let fixture: ComponentFixture<MarkerForm>;
  let element: HTMLElement;

  const input = (id: string) => element.querySelector<HTMLInputElement>(`#${id}`)!;
  const saveButton = () => element.querySelector<HTMLButtonElement>('button[type="submit"]')!;

  function type(id: string, value: string): void {
    const field = input(id);
    field.value = value;
    field.dispatchEvent(new Event('input'));
    field.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkerForm);
    fixture.componentRef.setInput('heading', 'New marker');
    fixture.componentRef.setInput('latitude', 50.4501);
    fixture.componentRef.setInput('longitude', 30.5234);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('keeps Save disabled for invalid values', () => {
    expect(saveButton().disabled).toBe(true);

    type('marker-name', '   ');
    expect(saveButton().disabled).toBe(true);

    type('marker-name', 'Kyiv');
    type('marker-latitude', '100');
    expect(saveButton().disabled).toBe(true);
  });

  it('emits saved with the entered values', () => {
    const saved = vi.fn();
    fixture.componentInstance.saved.subscribe(saved);

    type('marker-name', 'Kyiv');
    saveButton().click();

    expect(saved).toHaveBeenCalledWith({ name: 'Kyiv', latitude: 50.4501, longitude: 30.5234 });
  });

  it('updates the coordinates from the inputs and keeps the typed name', () => {
    type('marker-name', 'Kyiv');

    fixture.componentRef.setInput('latitude', 49.8397);
    fixture.componentRef.setInput('longitude', 24.0297);
    fixture.detectChanges();

    expect(input('marker-latitude').value).toBe('49.8397');
    expect(input('marker-longitude').value).toBe('24.0297');
    expect(input('marker-name').value).toBe('Kyiv');
  });

  it('emits cancelled on the × button and on Escape', () => {
    const cancelled = vi.fn();
    fixture.componentInstance.cancelled.subscribe(cancelled);

    element.querySelector<HTMLButtonElement>('button[aria-label="Close"]')!.click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(cancelled).toHaveBeenCalledTimes(2);
  });
});
