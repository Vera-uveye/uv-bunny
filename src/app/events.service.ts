import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  constructor(private firestore: AngularFirestore) { }


  private addEventToStorage(eventCollectionPath:string, data:any) {
    return this.firestore.collection(eventCollectionPath).doc().set(data);
  }

  public addBunnyEvent(bunnyId:string, eventName:string, ) {
    let data = {
    timestamp: new Date(),
    eventName: eventName,
    bunnyId: bunnyId
    }
    return this.addEventToStorage(`bunnies/${bunnyId}/events`, data);
  }
  
}
