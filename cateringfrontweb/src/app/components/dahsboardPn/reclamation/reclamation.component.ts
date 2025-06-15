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
  message: string = '';
  constructor(private ReclamationService:ReclamationServiceService,private fb:FormBuilder,private cmdService:CommandeServiceService){
    this.reclamationForm=this.fb.group({
      Objet:[''],
      MessageEnvoye:[''],
      Commande:['']
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
  get commandesFiltrees() {
    const now = new Date();
    return this.commandes.filter(c => {
      const statutValide = c.Statut !== 'en attente' && c.Statut !== 'prêt';
      if (!c.dateCommnade){
        return false;
      }
      const dateCommande = new Date(c.dateCommnade);
      const diffMs = now.getTime() - dateCommande.getTime();
      const diffJours = diffMs / (1000 * 60 * 60 * 24);
      return statutValide && diffJours <= 5;
    });
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
          this.message=("Réclamation bien enregistrée");
        },
        error: (error) => {
          const msg = error?.error?.message;
        if (msg) {
          alert(msg); 
        } else {
          alert("Une erreur s'est produite. Veuillez réessayer.");
        }
        },
      });
    } else {
      alert("Veuillez remplir tous les champs correctement.");
    }
  }
  
}

