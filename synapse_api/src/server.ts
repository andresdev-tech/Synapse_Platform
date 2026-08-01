import app from "./app";
import { env } from "./config/env";

const port = env.PORT;

app.listen(port, () => {
  console.log(`nexus-api is running on http://localhost:${port}`);
});