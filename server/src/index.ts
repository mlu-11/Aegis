import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { migrate } from './db';
import { authRouter } from './routes/auth';

const app = express();

app.use(helmet());
app.use(cors({ origin: '*'}));
app.use(express.json());

migrate();

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRouter);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});

