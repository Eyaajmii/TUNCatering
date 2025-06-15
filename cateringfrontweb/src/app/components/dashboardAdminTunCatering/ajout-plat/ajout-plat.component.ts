import { Component } from '@angular/core';
import { ReactiveFormsModule,FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlatServiceService } from '../../../services/plat-service.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-ajout-plat',
  standalone:true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './ajout-plat.component.html',
  styleUrl: './ajout-plat.component.css'
})
export class AjoutPlatComponent {
  NavOpen:boolean=true;
  mealForm: FormGroup;
  selectedFile:File |null=null;
  isSubmit=false;
  message: string = '';
  constructor(private fb: FormBuilder,private platService:PlatServiceService) {
    this.mealForm = this.fb.group({
      nom: ['', [Validators.required]],
      description: ['', [Validators.required]],
      typePlat: ['', Validators.required],
      Categorie:['',Validators.required],
      quantite:['',Validators.required]
      //image: ['', [Validators.required, Validators.pattern('(https?:\\/\\/.*\\.(?:png|jpg|jpeg|gif))')]]
    });
  }
  
  get formControls() {
    return this.mealForm.controls;
  }
  onFileSelected(ev:Event):void{
    const img=(ev.target as HTMLInputElement).files?.[0]||null;
    this.selectedFile=img;
  }
  onSubmit(): void {
    if (this.mealForm.valid && !this.isSubmit) {
      this.isSubmit=true;
      const data=new FormData();
      data.append('nom',this.mealForm.value.nom);
      data.append('description',this.mealForm.value.description);
      data.append('typePlat',this.mealForm.value.typePlat);
      data.append('Categorie',this.mealForm.value.Categorie);
      data.append('quantite',this.mealForm.value.quantite);
      if(this.selectedFile){
        data.append('image',this.selectedFile);
      }
      this.platService.creerPlat(data).subscribe({
        next: (res) => {
          this.message = 'Plat ajouté !';
          this.mealForm.reset();
          this.selectedFile=null;
        },
        error: (error) => {
            const message = error?.error?.message;
          if (message) {
            alert(message); 
          } else {
            alert("Une erreur s'est produite. Veuillez réessayer.");
          }
        },
        complete: () => {
          this.isSubmit = false; 
        }
      });
 
    }else{
      alert('Veuillez remplir tous les champs !');
    }
  }

}


