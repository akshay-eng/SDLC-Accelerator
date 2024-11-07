import { Component, Input, OnInit } from '@angular/core';
import { BreadcrumbModule, TilesModule } from 'carbon-components-angular';

@Component({
  selector: 'sdlctitle',
  standalone: true,
  imports: [TilesModule, BreadcrumbModule],
  templateUrl: './title.component.html',
  styleUrl: './title.component.scss'
})
export class TitleComponent implements OnInit{

  @Input() breadcrumb: string="";
  @Input() title: string="";
  ngOnInit(): void {
    
  }

}
