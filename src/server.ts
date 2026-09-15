import app from "./app.js";
import { config } from "./shared/config.js";

const PORT = config.PORT 

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});

