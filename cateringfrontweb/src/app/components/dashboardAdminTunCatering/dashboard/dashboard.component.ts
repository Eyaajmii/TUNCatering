import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CommandeServiceService } from '../../../services/commande-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  NavOpen: boolean = true;
  notifications: any[] = [];
  selectedItem: string = '';

  constructor(
    private commandeService: CommandeServiceService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.commandeService.getNewOrders().subscribe(notification => {
      this.toastr.success(notification.message, 'Nouvelle commande reçue');
    });
  }

  ngAfterViewInit(): void {
    const dropdowns = document.getElementsByClassName("dropdown-btn") as HTMLCollectionOf<HTMLElement>;

    for (let i = 0; i < dropdowns.length; i++) {
      const btn = dropdowns[i];

      btn.addEventListener("click", function (this: HTMLElement) {
        this.classList.toggle("active");

        const dropdownContent = this.nextElementSibling as HTMLElement | null;

        if (dropdownContent) {
          dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
        }
      });
    }
  }
  selectItem(item: string) {
    this.selectedItem = item;
  }
  
}
