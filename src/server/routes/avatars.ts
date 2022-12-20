import express, {Request, Response} from 'express';
import fs from 'fs';
import path from 'path';

declare global {
  var personas: any;
  var personaIndices: any;
}

const STATIC_DIR = './build/static';

const EXTENSION = '.webp';

/** Global object to store persona avatars. */
global.personas = {};

/** Global object to store persona indices. */
global.personaIndices = [];

/** Returns files within static directory that have specific extension. */
const getFiles = async (extension: string) => {
  const files = await fs.readdirSync(STATIC_DIR);

  return files.filter(file => {
    return path.extname(file).toLowerCase() === extension;
  });
};

/** Returns randome index from given array. */
const getRandomIndex = (arr: any[]): number => {
  // let index = return Math.ceil(Math.random() * arr.length);
  let index = Math.floor(Math.random() * arr.length);
  if (global.personaIndices.indexOf(index) === -1) {
    global.personaIndices.push(index);
    return index;
  }

  return getRandomIndex(arr);
}

export const routeAvatars = express.Router();

// Returns random avatar image for persona.
routeAvatars.all('/:name', async (req: Request, res: Response) => {
  const name = req.params.name;
  const webFiles = await getFiles(EXTENSION);

  if (!global.personas[name]) {
    let index = getRandomIndex(webFiles);
    global.personas[name] = webFiles[index];
  }

  res.status(200).redirect(`/static/${global.personas[name]}`);
});
