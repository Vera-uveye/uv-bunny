import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import firebase from 'firebase/compat/app';
import { map } from 'rxjs/operators';
import { EventsService } from '../events.service';
import FieldValue = firebase.firestore.FieldValue;

import {
  trigger,
  state,
  style,
  animate,
  transition,
  keyframes,
  // ...
} from '@angular/animations';

@Component({
  selector: 'app-bunny-details',
  templateUrl: './bunny-details.component.html',
  styleUrls: ['./bunny-details.component.css'],
  animations: [
  trigger('hopp', [
    transition('* <=> active', [
      animate('0.3s', keyframes([
        style({ transform: 'translateY(0) rotate(0deg)' }),
        style({ transform: 'translateY(-20%) rotate(10deg)' }),
        style({ transform: 'translateY(0) rotate(0deg)' })
      ]))
  ])
])
  ]
})
export class BunnyDetailsComponent implements OnInit {

  isHopp = true;
  toggle() { // trigger animation
    this.isHopp = !this.isHopp;
  }

  bunny: any = {
    id: '',
    name: 'Bunny Name',
    happiness: 0
  };

  profileBunnySub: any;
  lettuceConfSub: any;
  carrotConfSub: any;
  bunniesSub: any;
  bunnylist: any =[];
  playConfSub: any;
  selectedPlaymate: any;


  constructor(private firestore: AngularFirestore, private route: ActivatedRoute, private fb: FormBuilder, private eService: EventsService) { 
    // get selected bunny data
    this.route.queryParams.subscribe(param => {
      let id = param['id'];
      console.log('showing bunny ', id);
      if(id !== undefined) {
        this.profileBunnySub = firestore.collection('bunnies').doc(id).valueChanges().subscribe(b_obj => {
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

    // get list of playmate bunnies
    this.bunniesSub = firestore.collection('bunnies').snapshotChanges().pipe(
      map(changes => changes.map(c => (
        {id: c.payload.doc.id, data: c.payload.doc.data() }
      )
      ))
    ).subscribe(data => {
      this.bunnylist = [];
      // remove self
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

  // init playmate form
  playform = this.fb.group({
    playmate: ['', [Validators.required]]
  })


  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.playform.setValue({
      playmate: null
    })
    console.log("form ", this.playform)
  }

  feedLettuce() {
    // add event in database
    console.log('clicked feed lettuce');
    this.lettuceConfSub = this.firestore.collection('configurations').doc('feed-lettuce').get().subscribe(data => {
      this.eService.addBunnyEvent(this.bunny.id, 'feed-lettuce');
      this.toggle();
    })
  }

  feedCarrot() {
    // add event in database
    console.log('clicked feed carrot');
    this.carrotConfSub = this.firestore.collection('configurations').doc('feed-carrot').get().subscribe(data => {
      this.eService.addBunnyEvent(this.bunny.id, 'feed-carrot');
      this.toggle();
    })
  }

  onSubmit() {
    // clicking on play button to add points for playing
    console.log("clicked play with bunny");
    if (this.playform.valid) {
      console.log(this.playmate?.value);
      this.eService.addPlayEvent(this.bunny.id, this.selectedPlaymate.id).then(val => {
        console.log("played!");
      }).catch(err => {
        console.log("error on adding play event", err);
      });
      this.playmate?.setValue(null);
      this.toggle();
    }
  }

  changePlaymate() {
    console.log("selected mate", this.selectedPlaymate);
    this.playmate?.setValue(this.selectedPlaymate, {
      onSelf: true,
    })
  }

  get playmate() {
    return this.playform.get('playmate');
  }



  ngOnDestroy() {
    // unsubscibes
    if(this.profileBunnySub) {
    this.profileBunnySub.unsubscribe();
    }
    if(this.lettuceConfSub) {
    this.lettuceConfSub.unsubscribe();
    }
    if(this.carrotConfSub) {
    this.carrotConfSub.unsubscribe();
    }
    if(this.bunniesSub) {
      this.bunniesSub.unsubscribe();
    }
    if(this.playConfSub) {
      this.playConfSub.unsubscribe();
    }
  }

}
