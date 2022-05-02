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
      map(bunnies => bunnies.map(b => (
        {id: b.id, data: b }
      )
      ))
    ).subscribe(data => {
      console.log(data);
      this.bunnylist = data;
    })
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

  deleteBunny(bunny: any) {
    this.firestore.collection('bunnies').doc(bunny.id).delete().then(v => {
      console.log("deleted bunny ", bunny);
      this.show = true;
      setTimeout(() => {
        this.show = false;
      }, 5100);
    });
  }

  close() {
    this.show = false;
  }

  ngOnDestroy() {
    this.bunniesSub.unsubscribe();
  }
}
