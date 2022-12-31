import express, {Request, Response} from 'express';
import {ROLES} from '../../globals';
import rules from '../chat-rules';

export const routeAbout = express.Router();

routeAbout.get('/', async (_req: Request, res: Response) => {
  res.status(200).render('about.njk', {
    roles: ROLES,
    ...rules,
  });
});