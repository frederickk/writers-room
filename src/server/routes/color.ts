import express, {Request, Response} from 'express';

export const routeColor = express.Router();

// Sends defined color of chat person to client.
routeColor.all('/:name', async (req: Request, res: Response) => {
  const name = req.params.name;
  const persona: any = req.app.get(name);
  const color = persona.color;

  try {
    return res.status(200).send(color);
  } catch (error) {
    return res.status(500).send('yellow');
  }
});
