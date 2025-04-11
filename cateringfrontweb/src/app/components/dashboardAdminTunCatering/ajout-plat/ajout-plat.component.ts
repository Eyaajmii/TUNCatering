import { Component } from '@angular/core';
import { ReactiveFormsModule,FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlatServiceService } from '../../../services/plat-service.service';


@Component({
  selector: 'app-ajout-plat',
  standalone:true,
  imports: [ReactiveFormsModule],
  templateUrl: './ajout-plat.component.html',
  styleUrl: './ajout-plat.component.css'
})
export class AjoutPlatComponent {
  NavOpen:boolean=true;
  mealForm: FormGroup;
  selectedFile:File |null=null;
  isSubmit=false;
  constructor(private fb: FormBuilder,private platService:PlatServiceService) {
    this.mealForm = this.fb.group({
      nom: ['', [Validators.required]],
      description: ['', [Validators.required]],
      prix: ['', [Validators.required]],
      typePlat: ['', Validators.required],
      Categorie:['',Validators.required],
      Disponibilite: [false],
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
      data.append('prix',this.mealForm.value.prix);
      data.append('Categorie',this.mealForm.value.Categorie);
      data.append('quantite',this.mealForm.value.quantite);
      data.append('Disponibilite',this.mealForm.value.Disponibilite.toString());
      if(this.selectedFile){
        data.append('image',this.selectedFile);
      }
      this.platService.creerPlat(data).subscribe({
        next: (res) => {
          console.log('Plat ajouté:', res);
          alert("Plat ajouté")
          this.mealForm.reset();
          this.selectedFile=null;
        },
        error: (error) => {
          console.error("Erreur lors de l'ajout du plat:", error);
          if (error.error.message === "ce plat existe deja.") {
            alert("Plat déjà existe");
          } else {
            alert("Veuillez réessayer");
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


