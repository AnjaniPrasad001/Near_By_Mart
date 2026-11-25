import { Router } from 'express';
import { body } from 'express-validator';
import { chatWithAssistant } from '../controllers/assistantController';
import validate from '../middleware/validate';

const router = Router();

router.post(
  '/chat',
  [body('message').trim().notEmpty().withMessage('Message is required')],
  validate,
  chatWithAssistant,
);

export default router;
