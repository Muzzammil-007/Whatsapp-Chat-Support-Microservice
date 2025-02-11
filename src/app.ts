import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import whatsappRoutes from './routes/whatsappRoutes';
import { logger } from './utils/logger';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/whatsapphandler', whatsappRoutes);

// Health Check Endpoint
app.get('/', (req: Request, res: Response) => {
  res.send('WhatsApp Integration Service is running');
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ success: false, error: err.message });
});

export default app;
 