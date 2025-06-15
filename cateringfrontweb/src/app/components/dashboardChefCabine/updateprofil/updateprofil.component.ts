import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-updateprofil',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './updateprofil.component.html',
  styleUrl: './updateprofil.component.css'
})
export class UpdateprofilComponent {
  updateForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  constructor(private userService:AuthService, private fb: FormBuilder) {
    this.updateForm = this.fb.group({
      nom: [''],
      prenom: [''],
      email: ['', [Validators.email]],
      telephone: [''],
      password: ['']
    });
  }

  onSubmit() {
    if (this.updateForm.valid) {
      this.userService.ModifierUser(this.updateForm.value).subscribe({
        next: (res) => {
          this.successMessage = 'Utilisateur mis à jour avec succès.';
          this.errorMessage = '';
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors de la mise à jour : ' + err.error.message;
          this.successMessage = '';
        }
      });
    }
  }
}

