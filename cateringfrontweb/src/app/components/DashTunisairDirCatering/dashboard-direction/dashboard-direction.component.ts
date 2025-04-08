import { Component, OnInit, OnDestroy } from '@angular/core';  
import { CommandeServiceService } from '../../../services/commande-service.service';  
import { CommonModule } from '@angular/common';  
import { FormsModule } from '@angular/forms';  
import { Subscription } from 'rxjs';  
import * as XLSX from 'xlsx';  
import { saveAs } from 'file-saver';   

interface Commande {  
    _id: string;
    NombreCommande: number;
    dateCommnade: Date;
    Statut: string;
    MatriculePn?: any;  
    MatriculeResTun?: any;
    vol?: any;
    menu?: any;
    plats: any[];  
}  

@Component({
  selector: 'app-dashboard-direction',
  imports: [CommonModule,FormsModule],
  templateUrl: './dashboard-direction.component.html',
  styleUrl: './dashboard-direction.component.css'
})
export class DashboardDirectionComponent implements OnInit, OnDestroy {  
    commands: Commande[] = [];  
    connectionStatus: boolean = false;  
    error: string | null = null;  
    loading: boolean = true;  
    private subscriptions = new Subscription();  
    
    EXCEL_TYPE: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';  

    availableStatuses = [  
        { value: 'annulé', display: 'Annulé', class: 'annule' },  
    ];  

    constructor(private commandeService: CommandeServiceService) {}  

    ngOnInit(): void {  
        this.fetchCommandes();  
        this.setupConnectionListener();  
    }  

    exportToExcel(): void {
      const formatReference = (ref: any) => {
        return ref ? (ref._id ? this.formatId(ref._id) : 'N/A') : 'N/A';
      };
    
      const formattedCommands = this.commands.map(commande => ({
        'ID': this.formatId(commande._id),
        'Nombre de Commandes': commande.NombreCommande,
        'Statut': this.getStatusDisplayText(commande.Statut), // Utilise le texte d'affichage
        'Date de Commande': this.formatDateTime(commande.dateCommnade),
        'Matricule PN': formatReference(commande.MatriculePn),
        'Matricule Res Tunisie': formatReference(commande.MatriculeResTun),
        'Vol ID': formatReference(commande.vol),
        'Menu ID': formatReference(commande.menu),
        'Plats IDs': commande.plats?.length 
          ? commande.plats.map(plat => formatReference(plat)).join(', ') 
          : 'Aucun'
      }));
    
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedCommands);
      const workbook: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Commandes');
    
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data: Blob = new Blob([excelBuffer], { type: this.EXCEL_TYPE });
      saveAs(data, 'commandes_' + new Date().toISOString().slice(0,10) + '.xlsx');
    }

    fetchCommandes(): void {  
        this.loading = true;  
        this.subscriptions.add(  
            this.commandeService.getInitialOrders().subscribe({  
                next: (data: Commande[]) => {  
                    this.commands = data;  
                    this.loading = false;  
                },  
                error: (error: Error) => {  
                    this.error = error.message;  
                    this.loading = false;  
                }  
            })  
        );  
    }  

    setupConnectionListener(): void {  
        this.subscriptions.add(  
            this.commandeService.getConnectionStatus().subscribe(  
                (status: boolean) => this.connectionStatus = status  
            )  
        );  
    }  

    changerStatut(commandeId: string, nouveauStatut: string): void {  
        this.subscriptions.add(  
            this.commandeService.updateOrderStatus(commandeId, nouveauStatut).subscribe({  
                next: () => {  
                    const commande = this.commands.find(c => c._id === commandeId);  
                    if (commande) {  
                        commande.Statut = nouveauStatut;  
                    }  
                },  
                error: (error: Error) => {  
                    this.error = error.message;  
                }  
            })  
        );  
    }  

    formatId(id: string): string {  
        return id.substring(0, 8).toUpperCase();  
    }  

    formatDateTime(date: Date | string): string {  
        if (!date) return 'Date invalide';  
        
        const dateObj = new Date(date);  
        return isNaN(dateObj.getTime())   
            ? 'Date invalide'   
            : dateObj.toLocaleString('fr-FR', {  
                day: '2-digit',  
                month: '2-digit',  
                year: 'numeric',  
                hour: '2-digit',  
                minute: '2-digit'  
            });  
    }  

    getStatusClass(status: string): string {  
        const normalized = status.toLowerCase().replace(/\s+/g, '-');  
        return `status-${normalized}`;  
    }  

    getStatusDisplayText(status: string): string {  
        const foundStatus = this.availableStatuses.find(s => s.value === status);  
        return foundStatus ? foundStatus.display : status;  
    }  

    ngOnDestroy(): void {  
        this.subscriptions.unsubscribe();  
    }  
}