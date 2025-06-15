import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FactureService } from '../../../services/facture.service';

@Component({
  selector: 'app-prelevement',
  imports: [CommonModule],
  templateUrl: './prelevement.component.html',
  styleUrl: './prelevement.component.css'
})
export class PrelevementComponent implements OnInit {
  prelevements: any[] = [];
  loading: boolean = true;
  error: string = '';
  selectedPrelevId: string | null = null;
  selectedPrelevDetail: any = null;
constructor(private prelevementservice:FactureService){}
  ngOnInit(): void {
    this.prelevementservice.MesPrelevelment().subscribe({
      next: (data) => {
        this.prelevements = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors de la récupération des prélèvements.';
        this.loading = false;
      }
    })
  }
  toggleDetails(id: string) {
    if (this.selectedPrelevId === id) {
      this.selectedPrelevId = null;
      this.selectedPrelevDetail = null;
    } else {
      this.selectedPrelevId = id;
      this.prelevementservice.detailPrelevement(id).subscribe({
        next: (data) => {
          this.selectedPrelevDetail = data;
        },
        error: () => {
          this.selectedPrelevDetail = null;
        }
      });
    }
  }
}
