import express, {Request, Response} from 'express';

export const routeColor = express.Router();

const DEFAULT_COLOR = 'yellow';

// Sends defined color of chat person to client.
routeColor.all('/:name', async (req: Request, res: Response) => {
  let name: string;
  let persona: any;

  try {
    name = req.params.name;
    persona = req.app.get(name);
    const color = (persona)
      ? persona.color
      : DEFAULT_COLOR;

    return res.status(200).send(color);
  } catch (error) {
    console.warn(`/color ERROR`, error, persona);

    return res.status(500).send(DEFAULT_COLOR);
  }
});
