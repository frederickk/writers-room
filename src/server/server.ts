import bodyParser from 'body-parser';
import cors from 'cors';
import deepai from 'deepai';
import dotenv from 'dotenv-safe';
import express, {Application, Request, Response} from 'express';
import nunjucks from 'nunjucks';
import path from 'path';
import {ChatGPTAPIBrowser} from 'chatgpt';
import {oraPromise} from 'ora';

import {COLORS, NAME, ROLES, VERSION} from '../globals';
import {routeAbout} from './routes/about';
import {routeAsk} from './routes/ask';
import {routeAvatars} from './routes/avatars';
import {routeColor} from './routes/color';
import {routeDebug} from './routes/debug';
import {routeDeepai} from './routes/deepai';
import {Persona} from './persona';

const PORT = 3000;

dotenv.config({
  allowEmptyValues: true,
});

// Init ChatGPT API.
const openaiChat = new ChatGPTAPIBrowser({
  email: process.env.OPENAI_EMAIL!,
  password: process.env.OPENAI_PASSWORD!,
});

// Init DeepAI API.
deepai.setApiKey(process.env.DEEPAI_KEY!);

// Instantiate our 3 personas.
const janet = new Persona(openaiChat);
const marge = new Persona(openaiChat);
const rita = new Persona(openaiChat);

// Create Express app.
const app: Application = express()
  .engine('njk', nunjucks.render)
  .set('view engine', 'njk')
  .set('openai', openaiChat)
  .set('deepai', deepai)
  .set('janet', janet)
  .set('marge', marge)
  .set('rita', rita)
  .use(cors())
  .use(bodyParser.json({
    limit: '50mb',
    type: 'application/json'
  }))
  .use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
  }))
  // Routing
  .use('/v', (_req: Request, res: Response) => {
    res.status(200).send(`<pre>${NAME}\r\n${VERSION}</pre>`);
  })
  .use('/about', routeAbout)
  .use('/ask', routeAsk)
  .use('/avatars', routeAvatars)
  .use('/color', routeColor)
  .use('/debug', routeDebug)
  .use('/deepai', routeDeepai)
  .use('/static', express.static(path.join(__dirname, '..', '..', 'build', 'static')))
  .use('/', (_req: Request, res: Response) => {
    res.status(200).sendFile(path.join(__dirname, '..', '..', 'build', 'index.html'));
  });

/** Configures Nunjucks rendering engine. */
nunjucks.configure(path.join(__dirname, '..', '..', 'src', 'client'), {
  autoescape: true,
  express: app,
  watch: true,
});

/** Initializes Express server. */
const init = () => {
  return new Promise<void>((resolve) => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/`);
      resolve();
    });
  });
};

// Starts ChatGPT API intermediate server.
(async () => {
  await oraPromise(openaiChat.initSession(), {
    text: `☎️ Connecting to ChatGPT`,
  });
  await oraPromise(openaiChat.getIsAuthenticated(), {
    text: '🔑 Confirming authentication status',
  });

  await init();

  // TODO: Iterate over scalable object.
  await oraPromise(janet.init(ROLES.janet, COLORS[0]), {
    text: '👵🏽 Janet',
  });
  await oraPromise(marge.init(ROLES.marge, COLORS[1]), {
    text: '👵🏻 Marge',
  });
  await oraPromise(rita.init(ROLES.rita, COLORS[2]), {
    text: '👵🏿 Rita',
  });
  console.log('🤖👍');
})();
