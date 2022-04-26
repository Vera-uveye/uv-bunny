import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-bunny-details',
  templateUrl: './bunny-details.component.html',
  styleUrls: ['./bunny-details.component.css']
})
export class BunnyDetailsComponent implements OnInit {

  bunny: any = {
    name: 'Bunny Name',
    happiness: 0
  };

  constructor(private firestore: AngularFirestore, private route: ActivatedRoute) { 
    this.route.queryParams.subscribe(param => {
      let id = param['id'];
      console.log('showing bunny ', id);
      if(id !== undefined) {
        firestore.collection('bunnies').doc(id).get().subscribe(data => {
          console.log('bunny data ', data.data());
          this.bunny = data.data();
        })
      }
    })
  }

  ngOnInit(): void {
  }

}
