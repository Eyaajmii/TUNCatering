import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Plat, PlatServiceService } from '../../../services/plat-service.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-update-plat',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './update-plat.component.html',
  styleUrl: './update-plat.component.css'
})
export class UpdatePlatComponent implements OnInit {
  platForm!: FormGroup;
  platId!: string;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private platService: PlatServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.platId = this.route.snapshot.paramMap.get('id')!;
    this.initForm();
    this.platService.getPlatById(this.platId).subscribe({
      next: (data) => {
        this.platForm.patchValue(data);
      },
      error: (err) => {
        alert("Erreur lors du chargement du plat.");
        console.error(err);
      }
    });
  }

  initForm() {
    this.platForm = this.fb.group({
      nom: ['', Validators.required],
      description: ['', Validators.required],
      typePlat: ['', Validators.required],
      prix: [0, Validators.required],
      quantite: [0, Validators.required],
      Categorie: ['', Validators.required],
      Disponibilite: [false],
    });
  }

  onSubmit() {
    if (this.platForm.valid) {
      this.platService.updatePlat(this.platId, this.platForm.value).subscribe({
        next: () => {
          alert('Plat mis à jour avec succès.');
          this.router.navigate(['/DashAdmin/TousPlats']);
        },
        error: (err) => {
          alert('Erreur lors de la mise à jour.');
          console.error(err);
        }
      });
    }
  }
}
