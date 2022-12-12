import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fetch from 'node-fetch';

async function send(payload) {
  // console.log('send', JSON.stringify(payload));
  const res = await fetch(`${config.pixooServer}/post`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return await res.json();
}

let host = 'http://192.168.0.5:80'
const args = process.argv.slice(2);
if(args[0]) {
  host = args[0];
}

const config = {
  pixooServer: host,
  http: {
    port: 9527,
  },
};

let deviceConf = null;

(async function () {
  deviceConf = await send({Command: 'Channel/GetAllConf'});

  if(!deviceConf) {
    console.error('Can not get device config!');
    process.exit(-1);
  }

  await send({Command: 'Draw/ResetHttpGifId'});

  let gifId = 1;

  const app = express();
  app.use(cors());
  app.use(bodyParser.text({type: '*/*'}));

  app.get('/', (req, res) => {
    res.send({deviceConf, ...config});
  });

  let idMap = new Map();

  app.post('/send', async (req, res) => {
    try {
      const payload = JSON.parse(req.body);
      const id = payload.PicID;
      if(idMap.has(id)) {
        payload.PicID = idMap.get(id);
      } else {
        idMap.set(id, gifId);
        payload.PicID = gifId++;
      }
      const data = await send(payload);
      res.send({status: 'OK', data, payload});
    } catch (error) {
      res.send({status: 'ERROR', error: error.message});
    }
  });

  app.listen(config.http.port);

  console.log(`server running at http://localhost:${config.http.port}`);
})();