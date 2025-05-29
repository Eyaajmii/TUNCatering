import { Component, OnInit } from '@angular/core';
import { StatService } from '../../../services/stat.service';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-dash',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './dash.component.html',
  styleUrls: ['./dash.component.css']
})
export class DashComponent implements OnInit {
  stats: any;

  menuChart: any;
  platChart: any;
  doughnutChart: any;

  constructor(private statService: StatService) {}

  ngOnInit(): void {
    this.statService.getStat().subscribe(data => {
      this.stats = data;

      this.menuChart = {
        labels: data.topMenus.slice(0, 2).map((m: any) => m.name),
        datasets: [
          {
            label: 'Menus',
            data: data.topMenus.slice(0, 2).map((m: any) => m.count),
            backgroundColor: ['#3B82F6', '#60A5FA']
          }
        ]
      };

      this.platChart = {
        labels: data.topPlats.slice(0, 4).map((p: any) => p.name),
        datasets: [
          {
            label: 'Plats',
            data: data.topPlats.slice(0, 4).map((p: any) => p.count),
            backgroundColor: ['#F87171', '#FBBF24', '#34D399', '#60A5FA']
          }
        ]
      };

      this.doughnutChart = {
        labels: ['Menus', 'Plats'],
        datasets: [
          {
            data: [data.numberOfMenus, data.numberOfPlats],
            backgroundColor: ['#4ADE80', '#FBBF24']
          }
        ]
      };
    });
  }
}
