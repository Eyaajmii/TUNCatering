import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommandeServiceService } from '../../../services/commande-service.service';
import {MenuServiceService } from '../../../services/menu-service.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ajoutcommande-affrete',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './ajoutcommande-affrete.component.html',
  styleUrl: './ajoutcommande-affrete.component.css'
})
export class AjoutcommandeAffreteComponent implements OnInit{
  menus:any[]=[];
  vols:any[]=[];
  form:FormGroup;
constructor(private commandeService: CommandeServiceService,private menuService: MenuServiceService,private fb: FormBuilder,private router: Router) {
  this.form = this.fb.group({
    'numVol':[''],
    'nom':[''],
    'nbrCmd':[''],
  })
}
  ngOnInit(): void {
    this.menuService.TousMenu().subscribe(m=>{
      console.log(m);
      this.menus=m.map(menu=>({
        ...menu,
        nom:menu.nom.trim()
      }));
    })
    this.commandeService.getVols().subscribe(vols => {
      console.log(vols);
      this.vols = vols.map(vol => ({
          ...vol,
          numVol: vol.numVol.trim()
        }));
    });
  }

  onSubmit():void{
    if(this.form.valid){
      const data={
        numVol: this.form.value.numVol.trim(),
        nom: this.form.value.nom.trim(),
        nbrCmd: this.form.value.nbrCmd,
      };
      this.commandeService.CommanderAffretes(data).subscribe({
        next:(response) => {
          console.log(response);
        },
        error:(error) => {
          console.error(error);
        },
        complete:() => {
          console.log('complete');
        }
    });
    }else{
      console.log('form is invalid');
    }
  }
  retour(){
    this.router.navigate(['/TunisairCatering/CommandeAffretes'])
  }
}