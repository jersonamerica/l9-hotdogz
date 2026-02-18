const dns = require("dns");
dns.setServers(["8.8.8.8"]);
dns.resolveTxt("cluster0.6q3x7cj.mongodb.net", (err, records) => {
  if (err) {
    console.error("Error:", err);
  } else {
    console.log("TXT records:", records);
  }
  process.exit(0);
});
