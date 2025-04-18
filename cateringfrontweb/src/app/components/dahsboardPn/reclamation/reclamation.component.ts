import { Component, OnInit } from '@angular/core';
import { ReclamationServiceService } from '../../../services/reclamation-service.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-reclamation',
  imports: [ReactiveFormsModule],
  templateUrl: './reclamation.component.html',
  styleUrl: './reclamation.component.css'
})
export class ReclamationComponent {
  reclamationForm: FormGroup;
  constructor(private ReclamationService:ReclamationServiceService,private fb:FormBuilder){
    this.reclamationForm=this.fb.group({
      'Objet':[''],
      'MessageEnvoye':[''],
    })
  }
  onSubmit():void{
    if(this.reclamationForm.valid){
      const data={
      Objet:this.reclamationForm.value.Objet,
      MessageEnvoye:this.reclamationForm.value.MessageEnvoye,
      };
      
      this.ReclamationService.AjouterReclamation(data).subscribe({
        next:res=>{
          console.log("reclamation effectuée avec succès", res);
          alert("reclamation effectuée avec succès");
        },
        error:err=>{
          console.log("Erreur de reclamation", err);
          alert("Erreur lors de la reclamation. Veuillez réessayer.");
        }
      });
    }else{
      alert("Veuillez remplir tous les champs");
    }
    }
  }

