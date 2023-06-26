import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DataProviderService } from 'src/app/services/data-provider/data-provider.service';
import { forkJoin, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {

  constructor(private route: ActivatedRoute, private router: Router, private dataProvider: DataProviderService) {}

  ngOnInit() {
    // TODO: Simplify 
    this.route.paramMap.pipe(
      switchMap(map => {
        const groupId = map.get('id');
        if (groupId) {
          return of(groupId);
        } else {
          return this.dataProvider.createGroup();
        }
      }),
      switchMap(value => typeof value === 'string' ? of(value) : forkJoin([of(value.id), this.dataProvider.updateGroup(value.id, {id: value.id})]))
    )
    .subscribe(result => typeof result === 'string' ? this.router.navigate(['/group', result]) : this.router.navigate(['/group', result[0]]))
  }
}
