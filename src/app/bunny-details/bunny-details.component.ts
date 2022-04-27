import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import firebase from 'firebase/compat/app';
import { map } from 'rxjs/operators';
import { EventsService } from '../events.service';
import FieldValue = firebase.firestore.FieldValue;

@Component({
  selector: 'app-bunny-details',
  templateUrl: './bunny-details.component.html',
  styleUrls: ['./bunny-details.component.css']
})
export class BunnyDetailsComponent implements OnInit {

  bunny: any = {
    id: '',
    name: 'Bunny Name',
    happiness: 0
  };
  profilebunny$: any;
  lettuceconf$: any;
  carrotconf$: any;
  bunnies$: any;
  bunnylist: any =[];
  playconf$: any;


  constructor(private firestore: AngularFirestore, private route: ActivatedRoute, private fb: FormBuilder, private eService: EventsService) { 
    this.route.queryParams.subscribe(param => {
      let id = param['id'];
      console.log('showing bunny ', id);
      if(id !== undefined) {
        this.profilebunny$ = firestore.collection('bunnies').doc(id).valueChanges().subscribe(b_obj => {
          console.log('bunny data ', b_obj);
          let data:any = b_obj;
          this.bunny.id = id;
          this.bunny.name = data.name;
          if(data.happiness) {
            this.bunny.happiness = data.happiness;
          }
        })
      }
    })

    this.bunnies$ = firestore.collection('bunnies').snapshotChanges().pipe(
      map(changes => changes.map(c => (
        {id: c.payload.doc.id, data: c.payload.doc.data() }
      )
      ))
    ).subscribe(data => {
      this.bunnylist = [];
      if(this.bunny.id !== '' && this.bunny.id) {
        data.forEach(element => {
          if(element.id !== this.bunny.id) {
            this.bunnylist.push(element);
          }
        });
      }
      console.log(this.bunnylist);
    })

  }

  playform = this.fb.group({
    playmate: ['', [Validators.required]]
  })

  ngOnInit(): void {
  }

  feedLettuce() {
    console.log('clicked feed lettuce');
    this.lettuceconf$ = this.firestore.collection('configurations').doc('feed-lettuce').get().subscribe(data => {
      let conf:any = data.data();
      let points = conf.points;
      this.addPoints(points);
      this.eService.addBunnyEvent(this.bunny.id, 'feed-lettuce');
    })
  }

  feedCarrot() {
    console.log('clicked feed carrot');
    this.carrotconf$ = this.firestore.collection('configurations').doc('feed-carrot').get().subscribe(data => {
      let conf:any = data.data();
      let points = conf.points;
      this.addPoints(points);
      this.eService.addBunnyEvent(this.bunny.id, 'feed-carrot');

    })
  }

  onSubmit() {
    console.log("clicked play with bunny");
    if (this.playform.valid) {
      console.log(this.playmate?.value);
      this.playconf$ = this.firestore.collection('configurations').doc('play-first-time').get().subscribe(data => {
        let conf:any = data.data();
        let points = conf.points;
        this.addPoints(points);
      })
    }
  }

  changePlaymate(e: any) {
    console.log("selected mate", e.target.value);
    this.playmate?.setValue(e.target.value, {
      onSelf: true,
    })
  }

  get playmate() {
    return this.playform.get('playmate');
  }

  addPoints(points:number) {
    const increment = FieldValue.increment(points);
    this.firestore.collection('bunnies').doc(this.bunny.id).update({ happiness: increment })
  }

  ngOnDestroy() {
    if(this.profilebunny$) {
    this.profilebunny$.unsubscribe();
    }
    if(this.lettuceconf$) {
    this.lettuceconf$.unsubscribe();
    }
    if(this.carrotconf$) {
    this.carrotconf$.unsubscribe();
    }
    if(this.bunnies$) {
      this.bunnies$.unsubscribe();
    }
    if(this.playconf$) {
      this.playconf$.unsubscribe();
    }
  }

}
