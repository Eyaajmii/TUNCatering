import { Component, OnInit, OnDestroy, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';  
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ReclamationServiceService } from '../../../services/reclamation-service.service';


@Component({
  selector: 'app-dashboard-direction',
  imports: [RouterOutlet,CommonModule,RouterLink],
  templateUrl: './dashboard-direction.component.html',
  styleUrl: './dashboard-direction.component.css'
})
export class DashboardDirectionComponent implements OnInit ,AfterViewInit{
  NavOpen: boolean = true;
  notifications: any[] = [];
  selectedItem: string = '';
  constructor(private reclamationService:ReclamationServiceService, private toastr: ToastrService, @Inject(PLATFORM_ID) private platformId: Object){}

  ngOnInit(): void {
   this.reclamationService.getNewReclamation().subscribe(notification => {
    // this.notifications.push(notification);
     this.toastr.success(notification.message,"Nouvelle réclamation recu");
   });
 }
 ngAfterViewInit(): void {
  if (isPlatformBrowser(this.platformId)) {const dropdowns = document.getElementsByClassName("dropdown-btn") as HTMLCollectionOf<HTMLElement>;

  for (let i = 0; i < dropdowns.length; i++) {
    const btn = dropdowns[i];

    btn.addEventListener("click", function (this: HTMLElement) {
      this.classList.toggle("active");

      const dropdownContent = this.nextElementSibling as HTMLElement | null;

      if (dropdownContent) {
        dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
      }
    });
  }}
}
selectItem(item: string) {
  this.selectedItem = item;
}
}
