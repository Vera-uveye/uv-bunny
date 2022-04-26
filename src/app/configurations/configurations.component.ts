import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import FieldValue = firebase.firestore.FieldValue;

@Component({
  selector: 'app-configurations',
  templateUrl: './configurations.component.html',
  styleUrls: ['./configurations.component.css']
})
export class ConfigurationsComponent implements OnInit {
  configs: any;
  configs$: Subscription;

  constructor(private firestore: AngularFirestore) { 

    let ucinfig = firestore.collection('configurations').snapshotChanges();
    this.configs$ = ucinfig.pipe(
      map(changes => changes.map(c => (
        {id: c.payload.doc.id, data: c.payload.doc.data() }
      )
      ))
    ).subscribe(data => {
      console.log(data);
      this.configs = data;
    })
  }
  ngOnInit(): void {
  }

  addPoint(item:any) {
    console.log('clicked add point', item);
    const increment = FieldValue.increment(1);
    this.firestore.collection('configurations').doc(item.id).update({ points: increment })
  }
  reducePoint(item:any) {
    console.log('clicked reduce point', item);
    const decrement = FieldValue.increment(-1);
    this.firestore.collection('configurations').doc(item.id).update({ points: decrement })
  }

  ngOnDestory() {
    this.configs$.unsubscribe();
  }
}
