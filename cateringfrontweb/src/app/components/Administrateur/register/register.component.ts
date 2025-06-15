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
    "Personnel Tunisair",
    "Personnel Tunisie Catering"
  ];
  rolestunisair:string[]=[
    "Personnel navigant",
    "Personnel de Direction du Catering Tunisiar",
    "Personnel de Direction du Personnel Tunisiar",
  ];
  typePersonnels:string[]=[
    "Technique", "Commercial", "Stagiaire", "Chef de cabine","Affrété"
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
      roleTunisair:[''],
      TypePersonnel: ['']
    });
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      const roleTunisair = this.registerForm.get('roleTunisair');
      const matricule = this.registerForm.get('Matricule');
      const typePersonnel = this.registerForm.get('TypePersonnel');

      roleTunisair?.reset();
      matricule?.reset();
      typePersonnel?.reset();

      roleTunisair?.clearValidators();
      matricule?.clearValidators();
      typePersonnel?.clearValidators();

      if (role === 'Personnel Tunisair') {
        roleTunisair?.setValidators([Validators.required]);
      }

      roleTunisair?.updateValueAndValidity();
      matricule?.updateValueAndValidity();
      typePersonnel?.updateValueAndValidity();
    });

    this.registerForm.get('roleTunisair')?.valueChanges.subscribe(rt => {
      const matricule = this.registerForm.get('Matricule');
      const typePersonnel = this.registerForm.get('TypePersonnel');

      matricule?.reset();
      typePersonnel?.reset();

      matricule?.clearValidators();
      typePersonnel?.clearValidators();

      if (rt === 'Personnel navigant') {
        matricule?.setValidators([Validators.required]);
        typePersonnel?.setValidators([Validators.required]);
      } else if (rt === 'Personnel de Direction du Catering Tunisiar' || rt === 'Personnel de Direction du Personnel Tunisiar') {
        matricule?.setValidators([Validators.required]);
      }

      matricule?.updateValueAndValidity();
      typePersonnel?.updateValueAndValidity();
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.registerService.register(this.registerForm.value).subscribe({
        next: () => {
          alert('Utilisateur enregistré avec succès');
          this.registerForm.reset();
        },
        error: err => {
          alert('Erreur : ' + err.error);
        }
      });
    }
  }
}
