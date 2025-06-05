import { Component, OnInit } from '@angular/core';
import { ReclamationServiceService } from '../../../services/reclamation-service.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommandeServiceService } from '../../../services/commande-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reclamation',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './reclamation.component.html',
  styleUrl: './reclamation.component.css'
})
export class ReclamationComponent implements OnInit {
  reclamationForm: FormGroup;
  selectedFile:File |null=null;
  commandes:any[]=[];
  constructor(private ReclamationService:ReclamationServiceService,private fb:FormBuilder,private cmdService:CommandeServiceService){
    this.reclamationForm=this.fb.group({
      'Objet':[''],
      'MessageEnvoye':[''],
      'Commande':['']
    })
  }
  ngOnInit(): void {
    this.cmdService.getMyOrders().subscribe(cmds=>{
      this.commandes=cmds.map(c=>({
        ...c,
        Commande:c.numeroCommande
      }))
    })
  }
  
  isInvalid(controlName: string): boolean {
    const control = this.reclamationForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
  onFileSelected(ev:Event):void{
    const img=(ev.target as HTMLInputElement).files?.[0]||null;
    this.selectedFile=img;
  }
  onSubmit(): void {
    if (this.reclamationForm.valid) {
      const data = new FormData();
      data.append('numeroCommande', this.reclamationForm.value.Commande);
      data.append('Objet', this.reclamationForm.value.Objet);
      data.append('MessageEnvoye', this.reclamationForm.value.MessageEnvoye);
  
      if (this.selectedFile) {
        data.append('imageUrl', this.selectedFile);
      }
  
      this.ReclamationService.AjouterReclamation(data).subscribe({
        next: res => {
          console.log("réclamation effectuée avec succès", res);
          alert("Réclamation effectuée avec succès !");
        },
        error: err => {
          console.log("Erreur de réclamation", err);
  
          let errorMsg = "Erreur lors de la réclamation. Veuillez réessayer.";
          
          if (err.error) {
            if (typeof err.error === 'object' && err.error.message) {
              errorMsg = err.error.message;
            } 
            else if (typeof err.error === 'string') {
              errorMsg = err.error;
            }
          }
          
          alert(errorMsg);
        }
      });
    } else {
      alert("Veuillez remplir tous les champs correctement.");
    }
  }
  
}

