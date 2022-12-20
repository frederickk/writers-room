import express, {Request, Response} from 'express';
import {oraPromise} from 'ora';

export const routeDeepai = express.Router();

/**
 * Handles calls to DeepAI API.
 * @param  model  possible models:
 *    stable-diffusion
 *    text2img
 *    text-generator
 *    https://deepai.org/apis
 */
const replyHandler_ = (req: Request, res: Response, model: string) => {
  const api = req.app.get('deepai');
  const text = req.body.message;

  try {
    const reply = oraPromise(api.callStandardApi(model, {
      text,
    }));
    console.log(`**********\n${JSON.stringify(reply, null, 2)}\n**********`);

    return res.status(200).json({...reply});
  } catch (error) {
    return res.status(500).send({error});
  }
};

// Generates images with DeepAI 'text2img' API.
routeDeepai.all('/image', async (req: Request, res: Response) => {
  return await replyHandler_(req, res, 'text2img');
});

// Generates text with DeepAI 'text-generator' API.
routeDeepai.all('/text', async (req: Request, res: Response) => {
  return await replyHandler_(req, res, 'text-generator');
});