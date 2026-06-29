const db = require("../db");
async function run() {
  try {
    const snap = await db.collection("users").where("role", "in", ["admin", "warden"]).limit(1).get();
    const result = snap.docs.map(d => ({ email: d.data().email, role: d.data().role }));
    console.log(JSON.stringify(result));
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
run();
