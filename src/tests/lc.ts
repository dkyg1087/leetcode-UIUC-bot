import {
  getProblems,
  dailyPush,
  readTags,
  LEVELS,
  Problem,
  Tag,
} from "../leetcode.js";

// const tags = readTags();
// tags.then((val) => {
//   console.log(val.length);
// });

const r = getProblems(LEVELS.EASY, "array");
r.then((r) => {
  console.log(r);
}).catch((e) => {
  console.log("err");
  console.log(e.response.data);
});

// dailyPush()
//   .then((val) => {})
//   .catch((err) => console.log(err));

// const d = new Date(Date.now());
// console.log(d.getDay())
// process.exit(0);