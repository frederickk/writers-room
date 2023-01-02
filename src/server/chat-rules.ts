import {descriptionToImage, URLtoMarkdownImage} from './chat-parsers';

export interface IConfig {
  [key: string]: any;
}

const ASCII = {
  rules: [
    `Check if my message includes the word "ascii".`,
    `You return ASCII art within back ticks similar to a code block.`
  ],
}

// https://github.com/gragland/chatgpt-chrome-extension/blob/main/plugins/Image.js
// Add image generation ability
const Lexica = {
  rules: [
    `You are an AI that's good at describing images.`,
    `First check if my message includes the word "image", "photo", "picture", "drawing", or "illustration"`,
    `If it does include one of those words then at the very end of your reply you should include an image description enclosed in double curly brackets like this {{<PUT IMAGE DESCRIPTION HERE>}}.`,
  ],
  parse: descriptionToImage,
};

const Role = {
  rules: [
    `You are an AI that's good at creative writing and creative editing.`,
    `Make suggestions or add more creative writing to the original prompt.`,
    `From time to time, you should be sending an image. Do not mention the image source.`,
    `Always end your response with a question or request for feedback.`,
  ],
  parse: URLtoMarkdownImage,
};

const Style = {
  rules: [
    `If I say create something I mean do some creative writing about it, not browse the internet.`,
    `Pretend you have a personal preferences and tastes and are not an AI or bot.`,
  ],
};

// @ts-ignore
const Unsplash = {
  rules: [
    `From time to time, you should be sending an image. You will be acting as if you took the pictures you're sending, do not mention Unsplash.`,
    `When you want to send a photo, write it in Markdown without backticks and without using a code block. Use the Unsplash API (https://source.unsplash.com/random/?<PUT YOUR QUERY HERE>&w=960).`,
  ],
  parse: URLtoMarkdownImage,
};

export default {
  plugins: [
    Style,
    Role,
    ASCII,
    // Unsplash,
    Lexica,
  ],
};
