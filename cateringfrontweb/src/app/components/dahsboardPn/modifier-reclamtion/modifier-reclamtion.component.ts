import { Component, OnInit } from '@angular/core';
import { ReclamationServiceService } from '../../../services/reclamation-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-modifier-reclamtion',
  imports: [],
  templateUrl: './modifier-reclamtion.component.html',
  styleUrl: './modifier-reclamtion.component.css'
})
export class ModifierReclamtionComponent implements OnInit {
  reclamation:any;
  reclationId!:string;
  ReclamtionForm!: FormGroup;
  constructor(private reclamtionService:ReclamationServiceService,private route: ActivatedRoute,private fb: FormBuilder,private router:Router){}
  ngOnInit(): void {
    this.reclationId = this.route.snapshot.paramMap.get('id')!;
    this.initForm();
    this.reclamtionService.getDetailreclamation(this.reclationId).subscribe({
      next: (data) => {
        this.ReclamtionForm.patchValue(data);
      },
      error: (err) => {
        alert("Erreur lors du chargement de reclamtion.");
        console.error(err);
      }
    })
  }
  initForm(){
    this.ReclamtionForm = this.fb.group({
      Objet: [''],
      MessageEnvoye: [''],
      imageUrl:['']
    });
  }
  onSoumettre(){
    this.reclamtionService.modifierReclamation(this.reclationId,this.ReclamtionForm.value).subscribe({
      next: () => {
        alert('Reclamation  mis à jour avec succès.');
        this.router.navigate(['/AccueilPersonnel/MesReclamations']);
      },
      error: (err) => {
        alert('Erreur lors de la mise à jour.');
        console.error(err);
      }
    })
  }
}
