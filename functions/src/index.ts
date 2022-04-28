import * as functions from "firebase-functions";

import * as admin from "firebase-admin";
admin.initializeApp();

const db = admin.firestore();

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// eslint-disable-next-line require-jsdoc
function getPoints(eventName: string) {
  functions.logger.log(eventName);
  // get points by the event name from configurations collection in the database
  return new Promise((res, rej) => {
    db.collection("configurations").doc(eventName).get().then((confData) => {
      const data: any = confData.data();
      if (data) {
        const pts: number = data.points;
        res(pts);
      }
    }).catch((err) => {
      rej(err);
    });
  });
}

// eslint-disable-next-line require-jsdoc
function addBunnyPoints(_id:string, _points:any) {
  // add the points to happiness by the id of the bunny
  const increment = admin.firestore.FieldValue.increment(_points);
  db.collection("bunnies").doc(_id)
      .set({happiness: increment}, {merge: true});
  functions.logger.log("added points to", _id);
}

export const eventTrigger = functions.firestore
    .document("/bunnies/{bunnyid}/events/{docId}")
    .onCreate(async (snapshot, context) => {
      functions.logger.log("event trigger", context.params);
      // get points by event name
      const points = await getPoints(snapshot.data().eventName);
      // add points to the bunny happiness
      addBunnyPoints(context.params.bunnyid, points);
    });

// export const createCurrentState =
// functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

