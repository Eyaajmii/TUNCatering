import { Component, OnInit } from '@angular/core';
import { CommandeServiceService } from '../../../services/commande-service.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-commande-menu',
  imports: [ReactiveFormsModule],
  templateUrl: './commande-menu.component.html',
  styleUrl: './commande-menu.component.css'
})
export class CommandeMenuComponent implements OnInit {
  nom:string='';
  commandeFrom:FormGroup;
  constructor(private fb: FormBuilder,private cmdService:CommandeServiceService,private route:ActivatedRoute){
    this.commandeFrom=this.fb.group({
      'numVol':['',[Validators.required,Validators.pattern(/^\d{3}$/)]],
    })
  }
  
  ngOnInit(): void { 
    this.route.queryParams.subscribe(params=>{
      this.nom=params['Menu']||'';
    })
  }
  onSubmit(): void {
        if (this.commandeFrom.valid){
          const numVol = parseInt(this.commandeFrom.value.numVol);
          const data=new FormData();
          data.append('nom',this.nom);
          data.append('numVol',numVol.toString());
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
