import { Component, OnInit } from '@angular/core';
import { CommandeServiceService } from '../../../services/commande-service.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-commande-menu',
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
      numVol: ['', Validators.required],
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
    const data={
      numVol: this.commandeFrom.value.numVol.trim(),
      nom: this.nom,
    };
    this.cmdService.CommanderMenu(data).subscribe({
      next: res => {
        alert("Commande bien enregistrée");
      },
      error: (error) => {
        const message = error?.error?.message;
        if (message) {
          alert(message); 
        } else {
          alert("Une erreur s'est produite. Veuillez réessayer.");
        }
      },
    });
  }
}
