// @ts-nocheck
import bodyParser from 'body-parser';
import cors from 'cors';
import deepai from 'deepai';
import dotenv from 'dotenv-safe';
import express, {Application, Request, Response} from 'express';
import nunjucks from 'nunjucks';
import OneAI from 'oneai';
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
import {routeOneai} from './routes/oneai';
import {Persona} from './persona';

const PORT = 3000;

dotenv.config({
  allowEmptyValues: true,
});

// Init DeepAI API.
deepai.setApiKey(process.env.DEEPAI_KEY!);

// Init OneAI API.
const oneai = new OneAI(process.env.ONEAI_KEY);

// Init ChatGPT API.
const openaiChat = new ChatGPTAPIBrowser({
  email: process.env.OPENAI_EMAIL!,
  password: process.env.OPENAI_PASSWORD!,
});

// Instantiate our 3 personas.
const personas: {[key: string]: Persona} = {
  janet: new Persona(openaiChat, COLORS[0]),
  marge: new Persona(openaiChat, COLORS[1]),
  rita: new Persona(openaiChat, COLORS[3]),
}

// Create Express app.
const app: Application = express()
  .engine('njk', nunjucks.render)
  .set('view engine', 'njk')
  .set('deepai', deepai)
  .set('oneai', oneai)
  .set('openai', openaiChat)
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
  .use('/oneai', routeOneai)
  .use('/static', express.static(path.join(__dirname, '..', '..', 'static')))
  .use('/', (_req: Request, res: Response) => {
    res.status(200).render('index.njk', {});
  });

// Personas
for (const name in personas) {
  app.set(name.toLocaleLowerCase(), personas[name]);
}

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

// Starts server.
(async () => {
  await init();

  await oraPromise(openaiChat.initSession(), {
    text: `☎️ Connecting to ChatGPT`,
  });
  await oraPromise(openaiChat.getIsAuthenticated(), {
    text: '🔑 Confirming authentication status',
  });
  for (const name in personas) {
    await oraPromise(personas[name].init(ROLES[name]), {
      text: `👵🏽 ${name}`,
    });
  }

  console.log('🤖👍');
})();
