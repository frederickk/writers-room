import express, {Request, Response} from 'express';

export const routeOneai = express.Router();

routeOneai.all('/', async (req: Request, res: Response) => {
  const api = req.app.get('oneai');
  const text = req.body.message;

  try {
    const pipeline = new api.Pipeline(
      api.skills.topics(),
      api.skills.summarize(),
    );
    const reply = await pipeline.run(text).then((json: any) => json);
    console.log(`**********\n${JSON.stringify(reply, null, 2)}\n**********`);

    return res.status(200).json({...reply});
  } catch (error) {
    return res.status(500).send({error});
  }
});