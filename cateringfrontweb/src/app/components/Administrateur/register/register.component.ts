import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [FormsModule,CommonModule,ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm!:FormGroup;
  roles:string[]=[
    "Personnel navigant",
    "Personnel Tunisie Catering",
    "Personnel de Direction du Catering Tunisiar",
    "Personnel de Direction du Personnel Tunisiar",
  ];
  typePersonnels:string[]=[
    "Technique", "Commercial", "Stagiaire", "Chef de cabine"
  ]
  constructor(private fb: FormBuilder,private registerService:AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      telephone: ['', Validators.required],
      role: ['', Validators.required],
      Matricule: [''],
      TypePersonnel: ['']
    });
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      const matricule = this.registerForm.get('Matricule');
      const typePersonnel = this.registerForm.get('TypePersonnel');

      // Reset and disable by default
      matricule?.reset();
      typePersonnel?.reset();
      matricule?.clearValidators();
      typePersonnel?.clearValidators();

      if (role === 'Personnel navigant') {
        matricule?.setValidators([Validators.required]);
        typePersonnel?.setValidators([Validators.required]);
      } else if (
        role === 'Personnel de Direction du Catering Tunisiar' ||
        role === 'Personnel de Direction du Personnel Tunisiar'
      ) {
        matricule?.setValidators([Validators.required]);
      }

      matricule?.updateValueAndValidity();
      typePersonnel?.updateValueAndValidity();
    });
   }
   onSubmit(){
    if (this.registerForm.valid) {
      this.registerService.register(this.registerForm.value).subscribe({
        next: (res) => {
          alert('Utilisateur enregistré avec succès');
          this.router.navigate(['/admin-dashboard']); // à adapter selon votre route
        },
        error: (err) => {
          alert('Erreur : ' + err.error);
        }
      });
    }
  }
}
