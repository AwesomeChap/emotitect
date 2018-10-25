const request = require('request');
const subscriptionKey = '89e6391748934785915d313c396a8921';
const uriBase = 'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect';
const bodyParser = require('body-parser')
const express = require('express');
const app = express();
const fs = require('fs');
const axios = require('axios');
let msg = 'You are ';

var Kraken = require('kraken');

var kraken = new Kraken({
  api_key: '8ff6cc0b8070c1cd880c6f582cac5043',
  api_secret: 'a94d6abd92c35c1241bae96e621fb3c254915ef1'
});

let src = '';
let krakedUrl;
let foundEmotion;
let details;
let data;
let emotions;
const enames = ['anger', 'contempt', 'disgust', 'fear', 'happiness', 'neutral', 'sadness', 'surprise'];
const evalues = [];

function indexOfMax(arr) {
  if (arr.length === 0) {
    return -1;
  }

  var max = arr[0];
  var maxIndex = 0;

  for (var i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
    }
  }

  return maxIndex;
}

function triggerAPI() {

  let imageUrl = krakedUrl;

  const params = {
    'returnFaceId': 'true',
    'returnFaceLandmarks': 'false',
    'returnFaceAttributes': 'age,gender,headPose,smile,facialHair,glasses,' +
      'emotion,hair,makeup,occlusion,accessories,blur,exposure,noise'
  };
  const options = {
    uri: uriBase,
    qs: params,
    body: '{"url": ' + '"' + imageUrl + '"}',
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': subscriptionKey
    }
  };

  request.post(options, (error, response, body) => {
    if (error) {
      console.log('Error: ', error);
      return;
    }
    let jsonResponse = JSON.stringify(JSON.parse(body), null, '  ');
    // console.log('JSON Response\n');
    // console.log(jsonResponse);
    details = JSON.parse(body);
    emotions = details[0].faceAttributes.emotion;
    evalues[0] = details[0].faceAttributes.emotion.anger;
    evalues[1] = details[0].faceAttributes.emotion.contempt;
    evalues[2] = details[0].faceAttributes.emotion.disgust;
    evalues[3] = details[0].faceAttributes.emotion.fear;
    evalues[4] = details[0].faceAttributes.emotion.happiness;
    evalues[5] = details[0].faceAttributes.emotion.neutral;
    evalues[6] = details[0].faceAttributes.emotion.sadness;
    evalues[7] = details[0].faceAttributes.emotion.surprise;

    foundEmotion = enames[indexOfMax(evalues)];
    console.log(foundEmotion);
  });
}

function uploadImage() {

}

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '5mb'
}));

app.get('/', (req, res) => {
  res.render('pages/index', {
    src
  });
});

app.get('/details', (req, res) => {
  res.send(details);
  // res.send(emotions);
  // console.log(details);
})

app.get('/emotions', (req, res) => {
  res.send(emotions);
  console.log(foundEmotion);
});

app.get('/image', (req, res) => {
  res.render('pages/image')
})


app.post('/image', (req, res) => {
  const {
    snapSrc
  } = req.body;
  src = snapSrc;

  let data = src.replace("data:image/png;base64,", "");
  // save to file
  fs.writeFile("./public/img/image.png", data, {
    encoding: 'base64'
  }, function (err) {
    if (err) throw err;
    console.log('It\'s saved!');
    
    var opts = {
      file: fs.createReadStream('./public/img/image.png'),
      wait: true
    };

    kraken.upload(opts, function (err, data) {
      if (err) {
        console.log('Failed. Error message: %s', err);
      } else {
        console.log('Success. Optimized image URL: %s', data.kraked_url);
        krakedUrl = data.kraked_url;
        triggerAPI();
      }
    });
  });
});

app.listen(process.env.PORT || 1999, function () {
  console.log("server started on port 1999!");
});