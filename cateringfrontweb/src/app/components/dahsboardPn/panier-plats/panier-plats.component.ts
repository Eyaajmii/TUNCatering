import { Component, OnInit } from '@angular/core';
import { CommandeServiceService } from '../../../services/commande-service.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-panier-plats',
  imports: [ReactiveFormsModule],
  templateUrl: './panier-plats.component.html',
  styleUrl: './panier-plats.component.css'
})
export class PanierPlatsComponent implements OnInit {
  PEntree:string="";
  PPrincipal:string="";
  PDessert:string="";
  commandeFrom:FormGroup;
  constructor(private fb:FormBuilder,private CmdService:CommandeServiceService,private route:ActivatedRoute){
    this.commandeFrom=this.fb.group({
      'numVol':['',[Validators.required,Validators.pattern(/^\d{3}$/)]],
      'MatriculePn':['',Validators.required]
    })
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe(p=>{
      this.PEntree=p['Entree'] ||"";
      this.PPrincipal=p['Principaux']||"";
      this.PDessert=p['Dessert']||"";
    })
  }
  onSubmit():void{
    if (this.commandeFrom.valid){
      const numVol = parseInt(this.commandeFrom.value.numVol);
      const data=new FormData();
      data.append('nomEntree',this.PEntree);
      data.append('nomPlatPrincipal',this.PPrincipal);
      data.append('nomDessert',this.PDessert);
      data.append('numVol',numVol.toString());
      data.append('MatriculePn',this.commandeFrom.value.MatriculePn);
      this.CmdService.CommanderPlats(data).subscribe({
        next: res => {
            console.log("Commande effectuée avec succès", res);
            alert("Commande effectuée avec succès");
        },
        error: err => {
            console.log("Erreur de commande", err);
            alert("Erreur lors de la commande. Veuillez réessayer.");
        }
    });
    }else{
      alert("Veuillez remplir tous les champs");
    }
  }
}
