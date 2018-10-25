const bodyParser = require('body-parser')
const express = require('express');
const app = express();
const fs = require('fs');
const axios = require('axios');
const pd = require('paralleldots');
pd.apiKey = "pmehfkBEG0XSh7Oh16KZePchRhGwkLItZH1CYTXKTfo";

let src = '';

let foundEmotion;
let details;
let data;
let emotions;
const enames = ['anger','contempt','disgust','fear','happiness','neutral','sadness','surprise'];
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

function triggerAPI(){
  pd.facialEmotion('./public/img/image.png',type='local')
    .then((response) => {
        console.log(response);
        details = JSON.parse(response);
    })
    .catch((error) => {
        console.log(error);
    })
}

function uploadImage(){
  
}

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true ,limit: '5mb'}));

app.get('/',(req,res)=>{
  res.render('pages/index',{src});
});

app.get('/details',(req,res)=>{
  res.send(details);
  // res.send(emotions);
  // console.log(details);
})

app.get('/emotions',(req,res)=>{
  res.send(emotions);
});


app.post('/image',(req,res)=>{
  const {snapSrc} = req.body;
  src = snapSrc;
  // imageUrl = src;

  let data = src.replace("data:image/png;base64,", "");
  // save to file
  fs.writeFile("./public/img/image.png",data,{encoding: 'base64'}, function (err) {
    if (err) throw err;
    console.log('It\'s saved!');
    triggerAPI();
  });

  // imageUrl = 'http://localhost:1999/img/image.png';
  // console.log(JSON.stringify(foundEmotion));

  // uploadImage();
});

app.listen(process.env.PORT || 1999, function() {
  console.log("server started on port 1999!");
});