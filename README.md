# Writers' Room

v0.1.0

### Create or workshop ideas with a room of ChatGPT bots.

---
### Overview


---
### Getting Started

**Prerequisites**

1. Create an [OpenAI account](https://auth0.openai.com/u/signup/)
2. Create a [DeepAI account](https://deepai.org/)
3. Make sure you have **Node 18.0+** installed. I recommend [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) for handling Node versioning.

**Download, Build, and Serve**

1. Clone this repository into directory of your choice. `git clone https://github.com/frederickk/writers-room.git`
2. Install necessary dependencies `npm install`
3. Create a `.env` file, add your OpenAI login credentials `OPENAI_EMAIL="..."` and `OPENAI_PASSWORD="..."` and your DeepAI api key `DEEPAI_KEY="..."`.
4. [Build](#build) `npm run build`
5. Serve `npm run serve`.
6. Open [localhost:8080](https://localhost:3000/)
7. Et voilà!

---
### Build

| Command | Description |
| ------- | ----------- |
| `npm run build` | Runs Webpack build process once |
| `npm run clean` | Cleans `./build` and any cached files |
| `npm run dev`   | Runs Webpack build process and watches for changes; rebuilding as necessary |
| `npm run serve` | [`http://localhost:3000`](http://localhost:3000). |



