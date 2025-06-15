import { Component, OnInit } from '@angular/core';
import { CommandeServiceService, Vol } from '../../../services/commande-service.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-panier-plats',
  standalone:true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './panier-plats.component.html',
  styleUrl: './panier-plats.component.css'
})
export class PanierPlatsComponent implements OnInit {
  vols:Vol[]=[];
  PEntree:string="";
  PPrincipal:string="";
  PDessert:string="";
  PBoisson:string="";
  PDej:string[]=[];
  commandeFrom:FormGroup;
  constructor(private fb:FormBuilder,private CmdService:CommandeServiceService,private route:ActivatedRoute){
    this.commandeFrom=this.fb.group({
      numVol: ['', Validators.required],

    })
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe(p=>{
      this.PEntree=p['Entree'] ||"";
      this.PPrincipal=p['Principaux']||"";
      this.PDessert=p['Dessert']||"";
      this.PBoisson=p['Boissons']||"";
      this.PDej = p['PetitDej'] ? p['PetitDej'].split(',') : [];
    })
    this.CmdService.getVols().subscribe(vols => {
      console.log(vols);
      this.vols = vols.map(vol => ({
          ...vol,
          numVol: vol.numVol.trim()
        }));
    });
  }
  onSubmit():void{
    if (this.commandeFrom.valid){
      const data:any={
        nomEntree:this.PEntree,
        nomPlatPrincipal:this.PPrincipal,
        nomDessert:this.PDessert,
        nomBoissons:this.PBoisson,
        numVol: this.commandeFrom.value.numVol.trim(),
      }
      if (this.PDej && this.PDej.length > 0) {
        data.nomsPetitdejuner = this.PDej;
      }
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
