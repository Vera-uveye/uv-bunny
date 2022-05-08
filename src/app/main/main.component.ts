import { Component, Directive, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { NgForm } from '@angular/forms';
import { map, tap } from 'rxjs/operators';

export interface Bunny {
  name: string,
  happiness: number
}
export type SortColumn = keyof Bunny | '';
export type SortDirection = 'asc' | 'desc' | '';
const rotate: {[key: string]: SortDirection} = { 'asc': 'desc', 'desc': '', '': 'asc' };

const compare = (v1: string | number, v2: string | number) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;


export interface SortEvent {
  column: SortColumn;
  direction: SortDirection;
}
@Directive({
  selector: 'th[sortable]',
  host: {
    '[class.asc]': 'direction === "asc"',
    '[class.desc]': 'direction === "desc"',
    '(click)': 'rotate()'
  }
})
export class NgbdSortableHeader {

  @Input() sortable: SortColumn = '';
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<SortEvent>();

  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({column: this.sortable, direction: this.direction});
  }
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})


export class MainComponent implements OnInit {

  bunnylist: any;
  bunniesSub: any;
  show = false; // display delete toast
  averageHappiness = 0;

  constructor(private firestore: AngularFirestore) { 

    // get value changes of bunnies collection and order
    let ref = firestore.collection('bunnies', ref => ref.orderBy('name','asc'));
    this.bunniesSub = ref.valueChanges({ idField: 'id' }).pipe(
      tap(r => console.info(r)),
      map(bunnies => bunnies.map((b:any) => (
        {id: b.id, data: b, smiley: this.setIcon(b.happiness)}
      )
      ))
    ).subscribe((data: any) => {
      console.log(data);

      this.bunnylist = data;
      this.calcAvrg();
    })
  }

  calcAvrg() {
    // calculates the average happiness of the bunny colony
    let sum = 0;
    this.bunnylist.forEach((element:any) => {
      if(element.data.happiness) {
      sum += element.data.happiness;
      }
    });
    console.log('sum', sum);
    this.averageHappiness = Math.round(sum / this.bunnylist.length * 10) / 10;
  }

  setIcon(points: number | undefined) {
    // set the emoji according to happiness points
    if(points !== undefined) {
    if(points <1) {
      return "sentiment_very_dissatisfied"
    } else if(points <10) {
      return "sentiment_satisfied"
    } else if(points < 25) {
      return "sentiment_satisfied_alt"
    } else if(points <100) {
      return "sentiment_very_satisfied"
    } else {
      return "celebration"
    }
    }else {
      return ""
    }
  }

  ngOnInit(): void {
  }

  onSubmit(form: NgForm) {
    // add bunny form submit
    if(form.valid) {
      console.log('clicked add bunny', form.value);
      this.firestore.collection('bunnies').add(form.value);
      form.reset();
    }
  }

  async deleteBunny(bunny: any) {
    // remove bunny document and subcollections from the database with a batch commit
    const eventsPath = this.firestore.collection(`bunnies/${bunny.id}/events`);
    const playmatesPath = this.firestore.collection(`bunnies/${bunny.id}/playmates`);
    const docPath = this.firestore.collection('bunnies').doc(bunny.id);
    const batch = this.firestore.firestore.batch();

    let events = await eventsPath.get().toPromise();
      console.log(events);
      events?.docs.forEach((doc) => {
        console.log("events in bunny", doc.id)
        batch.delete(doc.ref);
      })
    
      let playmates = await playmatesPath.get().toPromise();
      console.log(playmates);
      playmates?.docs.forEach((doc) => {
        console.log("playmates of bunny", doc.id)
        batch.delete(doc.ref);
      })

    batch.delete(docPath.ref);

    await batch.commit().then(v => {
      console.log("deleted bunny ", bunny);
      this.show = true;
      setTimeout(() => {
        this.show = false;
      }, 5100);
    }).catch(err => {
      console.log("error deleting bunny ", err);
    });
  }

  close() { // close delete bunny toast
    this.show = false;
  }

  @ViewChildren(NgbdSortableHeader)
  headers!: QueryList<NgbdSortableHeader>;

  onSort({column, direction}: SortEvent) {
    // sorting the table
    console.log("sorting", column, direction);
    this.headers.forEach(header => {
      if(header.sortable !== column) {
        header.direction = '';
      }
    });

    if (direction === '' || column === '') {
    } else {
      this.bunnylist = [...this.bunnylist].sort((a, b) => {
        const res = compare(a.data[column], b.data[column]);
        return direction === 'asc' ? res : -res;
      });
    }
  }
  

  ngOnDestroy() {
    this.bunniesSub.unsubscribe();
  }
}
