import * as functions from "firebase-functions";

import * as admin from "firebase-admin";
admin.initializeApp();

const db = admin.firestore();

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript


// eslint-disable-next-line require-jsdoc
// function getPoints(eventName: string) {
//   functions.logger.log(eventName);
//   // get points by the event name from configurations collection in the database
//   return new Promise((res, rej) => {
//     db.collection("configurations").doc(eventName).get().then((confData) => {
//       const data: any = confData.data();
//       if (data) {
//         const pts: number = data.points;
//         res(pts);
//       }
//     }).catch((err) => {
//       rej(err);
//     });
//   });
// }

// eslint-disable-next-line require-jsdoc
// function addBunnyPoints(_id:string, _points:any) {
//   // add the points to happiness by the id of the bunny using incremental update
//   const increment = admin.firestore.FieldValue.increment(_points);
//   db.collection("bunnies").doc(_id)
//       .set({happiness: increment}, {merge: true});
//   functions.logger.log("added points to", _id);
// }

export const eventTrigger = functions.firestore
    .document("/bunnies/{bunnyid}/events/{docId}")
    .onCreate(async (snapshot, context) => {
      functions.logger.log("event trigger", context.params);
      // get points by event name
      // const points = await getPoints(snapshot.data().eventName);
      // add points to the bunny happiness
      // addBunnyPoints(context.params.bunnyid, points);
      updateBunnyHappiness(context.params.bunnyid);
    });

// eslint-disable-next-line require-jsdoc
// async function getAllEvents(bId:string) {
//   // gets all events data in the event pool of the specifies bunny
//   const eventids =
//   await db.collection("bunnies").doc(bId).collection("events").get();
//   return eventids.docs.map((it) => ({id: it.id, data: it.data()} ));
// }

// eslint-disable-next-line require-jsdoc
async function getBunnyHappiness(bId:string) {
  // gets all events data in the event pool of the specifies bunny
  let happiness = 0;
  const event = await getAllEventPoints(bId);
  event.forEach((element) => {
    happiness += element.points;
  });
  return happiness;
}

// eslint-disable-next-line require-jsdoc
async function getAllEventPoints(bId:string) {
  // gets all events data in the event pool of the specifies bunny
  const eventpoints = [];
  const eventids =
  await db.collection("bunnies").doc(bId).collection("events").get();
  // return eventids.docs.map(async (it) =>
  //   ({id: it.id, data: await getPointsByEvent(it.data().points )} ));
  for await (const event of eventids.docs) {
    const pts = getPointsByEvent(await event.data().eventName);
    eventpoints.push({id: event.id, points: await pts});
  }
  return eventpoints;
}

// eslint-disable-next-line require-jsdoc
async function getPointsByEvent(eventId: string) {
  functions.logger.log("event name ", eventId);
  const evnt =
  await db.collection("configurations").doc(eventId).get();
  const data = evnt.data();
  if (data) {
    functions.logger.log("points ", data.points);
    return data.points;
  } else {
    functions.logger.log("no data in event");
    return 0;
  }
}

// aggregate event points and return all bunnies + happiness
export const createCurrentState =
functions.https.onCall(async (data, context) => {
  functions.logger.info("Creating current status");
  const bunnylist = await db.collection("bunnies").listDocuments();
  const ids = bunnylist.map((it) => it.id);
  functions.logger.info(ids);
  const bs:any = [];
  for (const bunnyId of ids) {
    const es = await getBunnyHappiness(bunnyId);
    bs.push({
      bunny: bunnyId,
      happiness: es,
    });
  }
  return await bs;
});

// eslint-disable-next-line require-jsdoc
async function updateBunnyHappiness(bId:string) {
  // add the points to happiness by the id of the bunny using aggregation update
  const happypoints = await getBunnyHappiness(bId);
  db.collection("bunnies").doc(bId)
      .set({happiness: happypoints}, {merge: true});
  functions.logger.log("added points to", bId);
}

