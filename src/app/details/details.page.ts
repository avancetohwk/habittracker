import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IHabit } from 'src/interface/habit.interface';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {
  private habit: IHabit;
  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.habit= this.router.getCurrentNavigation().extras.state.habit;
        console.log(this.habit);
      }
    });
  }

  ngOnInit() {
  }

}
