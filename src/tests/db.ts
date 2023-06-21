import { addChannel, deleteChannel, listChannels, saveTag } from "../database.js";

// addChannel("1")
//   .then(() => {
//     return addChannel("2");
//   })
//   .then(() => {
//     return deleteChannel("1");
//   })
//   .then(() => {
//     return deleteChannel("2");
//   });

// listChannels().then((val) => {
//   console.log(val[0] == null);
// });

saveTag(2).then(() => {

  process.exit(0);
})
