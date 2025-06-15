import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CarnetSanteService } from '../../../services/carnet-sante.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ajout-carnet',
  imports: [ReactiveFormsModule],
  templateUrl: './ajout-carnet.component.html',
  styleUrl: './ajout-carnet.component.css'
})
export class AjoutCarnetComponent {
  carnetForm:FormGroup;
  constructor(private fb: FormBuilder,private CarnetService:CarnetSanteService,private router: Router) { 
    this.carnetForm = this.fb.group({
      'Allergies':[''] ,
      'Maladie': [''],
      'Medicaments': [''],
      'Commentaires': ['']
    })
  }
  onSubmit():void{
    const data={
      Allergies:this.carnetForm.value.Allergies,
      Maladie:this.carnetForm.value.Maladie,
      Medicaments:this.carnetForm.value.Medicaments,
      Commentaires:this.carnetForm.value.Commentaires
    };
    this.CarnetService.AjouterCarnetSante(data).subscribe({
      next:res=>{
        this.router.navigate(["/AccueilPersonnel/Profil/MonCarnet"]);
      },
      error:err=>{
        console.log("Erreur de carnet de santé", err);
        alert("Erreur du carnet de santé. Veuillez réessayer.");
      }
    })
  }
}
