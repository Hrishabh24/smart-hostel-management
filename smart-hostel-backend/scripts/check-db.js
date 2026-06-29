const db = require("../db");
async function run() {
  try {
    const snap = await db.collection("attendance").where("user_id", "==", 10).get();
    const result = snap.docs.map(d => d.data());
    console.log(JSON.stringify(result));
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
run();
