import { Component, OnInit } from '@angular/core';
import { CommandeServiceService } from '../../../services/commande-service.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-commande-menu',
   standalone: true, // Add this line
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './commande-menu.component.html',
  styleUrl: './commande-menu.component.css'
})
export class CommandeMenuComponent implements OnInit {
  vols:any[]=[];
  nom:string='';
  commandeFrom:FormGroup;
  constructor(private fb: FormBuilder,private cmdService:CommandeServiceService,private route:ActivatedRoute){
    this.commandeFrom=this.fb.group({
      'numVol':[''],
    })
  }
  
  ngOnInit(): void { 
    this.route.queryParams.subscribe(params=>{
      this.nom=params['Menu']||'';
    })
    this.cmdService.getVols().subscribe(vols => {
      console.log(vols);
      this.vols = vols.map(vol => ({
          ...vol,
          numVol: vol.numVol.trim()
        }));
    });
  }
  onSubmit(): void {
        if (this.commandeFrom.valid){
          const data={
            numVol: this.commandeFrom.value.numVol.trim(),
            nom: this.nom,
          };
          this.cmdService.CommanderMenu(data).subscribe({
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
