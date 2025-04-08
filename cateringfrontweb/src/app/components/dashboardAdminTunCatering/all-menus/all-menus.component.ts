import { Component, OnInit } from '@angular/core';
import { Menu, MenuServiceService } from '../../../services/menu-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-all-menus',
  imports: [CommonModule],
  templateUrl: './all-menus.component.html',
  styleUrl: './all-menus.component.css'
})
export class AllMenusComponent implements OnInit {
  menus:Menu[]=[];
  constructor(private MenuService:MenuServiceService){}
  ngOnInit(): void {
    this.MenuService.TousMenu().subscribe(d=>{
      console.log(d);
      this.menus=d;
    })
  }

}
