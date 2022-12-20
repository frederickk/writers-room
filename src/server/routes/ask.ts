import express, {Request, Response} from 'express';
import {oraPromise} from 'ora';

export const routeAsk = express.Router();

// Sends request to persona instance of ChatGPT API for response.
routeAsk.post('/:name', async (req: Request, res: Response) => {
  const name = req.params.name;
  const text = req.body.message;
  const persona: any = req.app.get(name);

  try {
    const reply: any = await oraPromise(persona.ask(text), {
      text,
    });
    console.log(`**********\n${JSON.stringify(reply, null, 2)}\n**********`);

    return res.status(200).json({...reply});
  } catch (error) {
    return res.status(500).send({error});
  }
});
