import { Component } from '@angular/core';
import { ReactiveFormsModule,FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-ajout-plat',
  imports: [ReactiveFormsModule],
  templateUrl: './ajout-plat.component.html',
  styleUrl: './ajout-plat.component.css'
})
export class AjoutPlatComponent {
  mealForm: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder) {
    this.mealForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      prix: ['', [Validators.required, Validators.min(1)]],
      typePlat: ['', Validators.required],
      disponibilite: [false],
      image: ['', [Validators.required, Validators.pattern('(https?:\\/\\/.*\\.(?:png|jpg|jpeg|gif))')]]
    });
  }

  get formControls() {
    return this.mealForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.mealForm.valid) {
      console.log('Form Data:', this.mealForm.value);
      alert('Repas ajouté avec succès !');
      this.mealForm.reset();
      this.submitted = false;
    }
  }

}
