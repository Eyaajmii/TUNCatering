import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modifier-info',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './modifier-info.component.html',
  styleUrl: './modifier-info.component.css'
})
export class ModifierInfoComponent implements OnInit {
  profileForm!: FormGroup;
  successMessage = '';
  errorMessage = '';
  userInfo: any;

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (token) {
      this.userInfo = this.authService.decodeToken(token);
    }

    this.profileForm = this.fb.group({
      nom: [this.userInfo?.nom || '', Validators.required],
      prenom: [this.userInfo?.prenom || '', Validators.required],
      email: [this.userInfo?.email || '', [Validators.required, Validators.email]],
      telephone: [this.userInfo?.telephone || '', Validators.required],
      username: [this.userInfo?.username || '', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    this.authService.ModifierUser(this.profileForm.value).subscribe({
      next: (res) => {
        this.successMessage = res.message;
        this.errorMessage = '';
      },
      error: (err) => {
        this.successMessage = '';
        this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour';
      }
    });
  }
}