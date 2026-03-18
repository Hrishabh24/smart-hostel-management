const db = require("./db");
db.query("SELECT email, role FROM users WHERE role IN ('admin', 'warden') LIMIT 1", (err, result) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(JSON.stringify(result));
    process.exit(0);
});
