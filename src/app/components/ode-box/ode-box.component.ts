import { Component, ViewEncapsulation, ViewChild, TemplateRef, EventEmitter, NgModule, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { SwipeCardsModule } from 'ng2-swipe-cards';
import { OdeService } from '../../services/ode/ode.service';
import { AuthService } from '../../services/auth/auth.service';

const BUFFER = 2;

@Component({
  selector: 'app-ode-box',
  templateUrl: './ode-box.component.html',
  styleUrls: ['./ode-box.component.css']
})
export class OdeBoxComponent implements OnInit {

  loading = true;
  odes: any[] = [];
  cardCursor = 0;
  orientation = 'x';
  overlay: any = {
    like: {
      backgroundColor: 'antiquewhite'
  },
    dislike: {
      backgroundColor: 'black'
  }
  };
  @Input() currentUser;

  constructor(private odeService: OdeService, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.getMore();
  }

  private getMore() {
    if (this.cardCursor < this.odes.length - BUFFER) {
      return;
    }
    this.odeService.getRandom(this.odes.map(ode => ode._id))
    .subscribe(
      (result) => {
        this.loading = false;
        const newResult = result.map(ode => Object.defineProperty(ode, 'likeEvent', {
          enumerable: false,
          configurable: false,
          writable: false,
          value: new EventEmitter()
        }));
        this.odes = this.odes.concat(newResult);
    });
  }

  onCardLike(event) {
    const item = this.odes[this.cardCursor++];
    if (event.like === true) {
      const odeId = {id: item._id};
      this.authService.addOde(odeId).subscribe(
        () => {
          const link = `/ode/${item._id}`;
          this.router.navigate([link]);
        }
      );
    }
  }

  like(like) {
    const item = this.odes[this.cardCursor++];
    item.likeEvent.emit({ like });
    this.getMore();
    if (like === true) {
      const link = `/ode/${item._id}`;
      this.router.navigate([link]);
    }
  }

  onRelease(event) {
    this.getMore();
  }

  onAbort(event) {
    console.log('onAbort()');
  }

  onSwipe(event) {
  }

}
