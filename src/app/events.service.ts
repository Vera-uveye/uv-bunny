import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  constructor(private firestore: AngularFirestore) { }


  private async addEventToStorage(eventCollectionPath:string, data:any) {
    return await this.firestore.collection(eventCollectionPath).doc().set(data);
  }

  public async addBunnyEvent(bunnyId:string, eventName:string, ) {
    let data = {
    timestamp: new Date(),
    eventName: eventName,
    bunnyId: bunnyId
    }
    return await this.addEventToStorage(`bunnies/${bunnyId}/events`, data);
  }

  private async addPlaymate(bunny1Id: string, bunny2Id: string) {
    console.log('ids', bunny1Id, bunny2Id);
    await this.firestore.collection("bunnies").doc(bunny1Id).collection('playmates').doc(bunny2Id).set({id: bunny2Id});
    await this.firestore.collection("bunnies").doc(bunny2Id).collection('playmates').doc(bunny1Id).set({id: bunny1Id});
  }

  public async addPlayEvent(bunny1Id: string, bunny2Id: string) {
    let playmates = await this.firestore.collection('bunnies').doc(bunny1Id).collection('playmates').get().toPromise();
    if(playmates) {
      if(playmates.docs && playmates.docs.length > 0) {
        let played = false;
        for await (const mate of playmates.docs) {

          if(mate.id === bunny2Id) {
            this.addBunnyEvent(bunny1Id, 'play-with-known');
            this.addBunnyEvent(bunny2Id, 'play-with-known');
            played = true;
          }
        };
        if (!played) {
          this.addBunnyEvent(bunny1Id, 'play-first-time');
          this.addBunnyEvent(bunny2Id, 'play-first-time');
          this.addPlaymate(bunny1Id, bunny2Id);
        }
      } else {
        this.addBunnyEvent(bunny1Id, 'play-first-time');
        this.addBunnyEvent(bunny2Id, 'play-first-time');
        this.addPlaymate(bunny1Id, bunny2Id);
      }
    }
  }
  
}
