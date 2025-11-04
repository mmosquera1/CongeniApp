import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initFirebase } from './config/firebase';
import usersRouter from './routes/users';
import reviewsRouter from './routes/reviews';
import servicesRouter from './routes/services';
import listingsRouter from './routes/listings';
import verificationsRouter from './routes/verifications';

dotenv.config();
initFirebase();

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : '*';

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/users', usersRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/services', servicesRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/verifications', verificationsRouter);

const port = process.env.PORT ?? 4000;
app.listen(port, () => {
  console.log(`CongeniApp API listening on port ${port}`);
});
