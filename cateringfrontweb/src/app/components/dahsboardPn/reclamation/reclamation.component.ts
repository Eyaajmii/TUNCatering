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
  selectedFile:File |null=null;
  constructor(private ReclamationService:ReclamationServiceService,private fb:FormBuilder){
    this.reclamationForm=this.fb.group({
      'Objet':[''],
      'MessageEnvoye':[''],
    })
  }
  onFileSelected(ev:Event):void{
    const img=(ev.target as HTMLInputElement).files?.[0]||null;
    this.selectedFile=img;
  }
  onSubmit():void{
    if(this.reclamationForm.valid){
      const data = new FormData();
      data.append('Objet', this.reclamationForm.value.Objet);
      data.append('MessageEnvoye', this.reclamationForm.value.MessageEnvoye);
  
      if (this.selectedFile) {
        data.append('imageUrl', this.selectedFile);
      }
      
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

