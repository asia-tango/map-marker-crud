import { Component, effect, inject, input, output } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { Marker } from '../marker.model';

export type MarkerFormValue = Omit<Marker, 'id'>;

function notBlank(control: AbstractControl<string>): ValidationErrors | null {
  return control.value.trim() ? null : { blank: true };
}

@Component({
  selector: 'app-marker-form',
  imports: [ReactiveFormsModule],
  host: {
    '(document:keydown.escape)': 'cancel()',
  },
  templateUrl: './marker-form.html',
  styleUrl: './marker-form.scss',
})
export class MarkerForm {
  readonly latitude = input.required<number>();
  readonly longitude = input.required<number>();
  readonly name = input('');

  readonly saved = output<MarkerFormValue>();
  readonly cancelled = output<void>();

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, notBlank, Validators.maxLength(100)]],
    latitude: [0, [Validators.required, Validators.min(-90), Validators.max(90)]],
    longitude: [0, [Validators.required, Validators.min(-180), Validators.max(180)]],
  });

  constructor() {
    // Separate effects, so a new map click moves the point without resetting the typed name.
    effect(() => this.form.controls.name.setValue(this.name()));
    effect(() =>
      this.form.patchValue({ latitude: this.latitude(), longitude: this.longitude() }),
    );
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saved.emit(this.form.getRawValue());
  }

  protected cancel(): void {
    this.cancelled.emit();
  }
}
