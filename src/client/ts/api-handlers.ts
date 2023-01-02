/**
 * @fileoverview Handlers for events within plugin's UI panel.
 */

import {findRegexMatches} from '../../utils';

/**
 * Fetches requests from given endpoint of ChatGPTAPI intermediate server.
 * @param endpoint  endpoint for request type
 * @param message   optional body message
 */
export const chatAPIFetch = async (endpoint: string, message: string = ''):
    Promise<Response | undefined> => {
  return await fetch(`http://localhost:3000/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
    }),
  });
};

/**
 * Handles message responses from intermediate ChatGPTAPI server.
 * @param endpoint  endpoint for request type
 * @param message   body message
 */
export const chatAPIResponseHandler = async (endpoint: string, message: string):
    Promise<string | null> => {
  console.groupCollapsed(`awaiting response... ${endpoint}`);
  console.log(`"${message}"`);
  console.groupEnd();

  const chat = await chatAPIFetch(endpoint, message)
    .catch((error) => {
      console.log(error);
    });
  const json = await chat?.json();

  return json?.response;
};

/**
 * Handles color responses.
 */
export const colorResponseHandler = async (endpoint: string):
    Promise<Response> => {
  return await fetch(`http://localhost:3000/color/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

/**
 * Handles message responses from intermediate OneAI server.
 * @param message   body message
 */
export const oneAIResponseHandler = async (message: string): Promise<any> => {
  const regex = /!\[.*?\]\((.*?)\)/gmi;
  const images = await findRegexMatches(regex, message, async (_str) => {
  });

  const reply = await fetch(`http://localhost:3000/oneai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
    }),
  });
  const json = await reply?.json();
  json.images = images.arr;

  return json;
};
