import * as functions from "firebase-functions";

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

// eslint-disable-next-line require-jsdoc
// function getPoints(eventName: string) {
//   functions.logger.log(eventName);
//   // get points by the event name from configurations collection in the database

//   // return points
//   return 1;
// }

// eslint-disable-next-line require-jsdoc
// function addBunnyPoints(_id:string, _points:number) {
//   // add the points to happiness by the id of the bunny
//   functions.logger.log("added points");
// }

export const eventTrigger = functions.firestore
    .document("/bunnies/{bunnyid}/events/{docId}")
    .onCreate((snapshot, context) => {
      functions.logger.log("event trigger", context.params);
      // get points by event name
    //   const points = getPoints("feed-carrot");
      // add points to the bunny happiness
    //   addBunnyPoints(snapshot.id, points);
    });

// export const createCurrentState =
// functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

