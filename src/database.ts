import firebase from 'firebase/compat/app'
import 'firebase/compat/database'

const credentials = JSON.parse(process.env.firebaseConfig!);

firebase.initializeApp(credentials);

const db = firebase.database()

async function addChannel(channelID: string) {
  let ref = db.ref("/");
  const d = await ref.get();
  let old: Array<string>;
  if (!d.child("channels").exists()) {
    old = [];
  } else {
    old = d.child("channels").val();
  }
  console.log(old);
  await ref.update({ channels: old.concat([channelID]) });
}

async function deleteChannel(channelID: string) {
  const d = await db.ref("/").get();
  if (!d.child("channels").exists()) {
    return;
  }
  let c: Array<string> = d.child("channels").val();
  c = c.filter((v, i, a) => {
    if (channelID == v) return false;
    return true;
  });
  await db.ref("/").update({ channels: c });
}

async function listChannels() {
  let chans = await db.ref("/channels").get();
  if (chans.val() == null) return [];
  return chans.val() as Array<string>;
}

async function saveTag(index: number) {
  let ref = db.ref("/lastTagIndex");
  await ref.set(index);
}

async function getTag(): Promise<number> {
  let ref = db.ref("/");
  const d = await ref.child("lastTagIndex").get();
  let last = 0;
  if (d.exists()) {
    last = d.val();
  } else {
    await ref.update({ lastTagIndex: 0 });
  }
  return last as number;
}

async function getSeenQuestions(): Promise<{
  tagIndex: number;
  seen: Array<number>;
}> {
  let ref = db.ref("/");
  const d = await ref.child("seenQuestions").get();
  let seen: { tagIndex: number; seen: Array<number> } = {
    tagIndex: -1,
    seen: [],
  };
  if (d.exists()) {
    seen = d.val() as { tagIndex: number; seen: Array<number> };
  } 
  return seen;
}

async function saveSeenQuestions(
  tag: number,
  seen: Array<number>
): Promise<void> {
  let ref = db.ref("/");
  await ref.update({ seenQuestions: { tagIndex: tag, seen: seen } });
}

async function saveItem(refference:string,item:any):Promise<void>{
  let ref = db.ref(refference);
  await ref.set(item);
}

async function getItem(refference:string):Promise<Array<Object>>{
  let ref = db.ref(refference);
  return (await ref.get()).val()
}

async function removeDir(refference:string):Promise<void>{
  let ref = db.ref(refference)
  await ref.remove();
}


export {
  removeDir,
  addChannel,
  deleteChannel,
  listChannels,
  saveTag,
  getTag,
  saveSeenQuestions,
  getSeenQuestions,
  getItem,
  saveItem
};
