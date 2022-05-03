import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  // bunnies: Observable<any[]>;
  bunnylist: any;
  bunniesSub: any;
  show = false;

  constructor(private firestore: AngularFirestore, private fnctns: AngularFireFunctions) { 
    // this.bunnies = firestore.collection('bunnies').valueChanges();
    // this.bunnies.subscribe(x => {
    //   this.bunnylist = x;
    //   console.log('bunnies', this.bunnylist);
    // })

    // const status = fnctns.httpsCallable('createCurrentState');
    // status('hi').toPromise().then(data => {
    //   console.log('bunnies from the cloud', data)
    // })

    this.bunniesSub = firestore.collection('bunnies').valueChanges({ idField: 'id' }).pipe(
      tap(r => console.info(r)),
      map(bunnies => bunnies.map((b:any) => (
        {id: b.id, data: b, smiley: this.setIcon(b.happiness)}
      )
      ))
    ).subscribe((data: any) => {
      console.log(data);

      this.bunnylist = data;
    })
  }

  setIcon(points: number | undefined) {
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

  goToBunnyDetails(bunny: any) {
    console.log('clicked on table row', bunny);
  }

  onSubmit(form: NgForm) {
    if(form.valid) {
      console.log('clicked add bunny', form.value);
      this.firestore.collection('bunnies').add(form.value);
      form.reset();
    }
  }

  async deleteBunny(bunny: any) {
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
    // this.firestore.collection('bunnies').doc(bunny.id).delete().then(v => {
    //   console.log("deleted bunny ", bunny);
    //   this.show = true;
    //   setTimeout(() => {
    //     this.show = false;
    //   }, 5100);
    // });
  }

  close() {
    this.show = false;
  }

  onSort(e: Event) {
    console.log("sorting");
  }

  ngOnDestroy() {
    this.bunniesSub.unsubscribe();
  }
}
