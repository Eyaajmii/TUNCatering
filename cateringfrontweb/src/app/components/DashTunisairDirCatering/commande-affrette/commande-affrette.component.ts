import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommandeServiceService } from '../../../services/commande-service.service';
import { Menu, MenuServiceService } from '../../../services/menu-service.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-commande-affrette',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './commande-affrette.component.html',
  styleUrl: './commande-affrette.component.css'
})
export class CommandeAffretteComponent implements OnInit{
  menus:any[]=[];
  form:FormGroup;
constructor(private commandeService: CommandeServiceService,private menuService: MenuServiceService,private fb: FormBuilder) {
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
  }

  onSubmit():void{
    if(this.form.valid){
      const numVol = parseInt(this.form.value.numVol);
      const data=new FormData();
      data.append('numVol',numVol.toString());
      data.append('nom',this.form.value.nom.trim());
      data.append('nbrCmd',this.form.value.nbrCmd.toString());
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
}
