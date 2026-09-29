import { Component, OnInit, effect, inject, input, output } from '@angular/core';
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
export class MarkerForm implements OnInit {
  readonly heading = input.required<string>();
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
    // Only the coordinates follow the inputs, so a map click never overwrites the typed name.
    effect(() =>
      this.form.patchValue({ latitude: this.latitude(), longitude: this.longitude() }),
    );
  }

  ngOnInit(): void {
    this.form.controls.name.setValue(this.name());
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
