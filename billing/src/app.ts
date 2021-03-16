import express from 'express';
import 'express-async-errors';

import { setupRoutes } from './routes/routes';

const app = express();

setupRoutes(app);

export { app };
