const server = require("./app");
const { PORT } = require("./config");
server(PORT).then(() => console.log(`Server runnig at port ${PORT}`));
