const app = require("./config/server");
//
const SERVER_PORT = 3000;
app.listen(SERVER_PORT, () => {
  console.log(`Server is running on SERVER_PORT ${SERVER_PORT}`);
});
