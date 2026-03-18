const db = require("./db");
db.query("SELECT * FROM attendance WHERE user_id = 10", (err, result) => {
    console.log(JSON.stringify(result));
    process.exit(0);
});
