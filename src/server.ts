import {app} from "./app.js";
import { config } from "./shared/config.js";
import { getQueryCount, resetQueryCount } from "./shared/db.js";

const PORT = config.PORT 

// dev only — never ship this to production
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    resetQueryCount();
    next();
  });

  app.use((req, res, next) => {
    res.on('finish', () => {
      console.log(`[${req.method} ${req.path}] queries: ${getQueryCount()}`);
    });
    next();
  });
}

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});

