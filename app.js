const express = require('express');
const bodyParser = require('body-parser');
const Algorithmia = require("algorithmia");
const emoKey = 'simJ4HQ6y1M2yd7rtly59VztAZP1';
const app = express();
let src = '';

let foundEmotion;

const emotions = {
  happy:'',
  neutral:'',
  disgust:'',
  sad:'',
  fear:'',
  angry:'',
  surprise:''
}


app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true ,limit: '5mb'}));

app.get('/',(req,res)=>{
  res.render('pages/index',{src});
});

app.get('/emotions',(req,res)=>{
  let input = {
    "image": src || false,
    "numResults": 7
  };
  // console.log(foundEmotion);
  Algorithmia.client(emoKey).algo("deeplearning/EmotionRecognitionCNNMBP/1.0.1").pipe(input).then(function(response) {
    const resEmotions = response.result.results[0].emotions;
    res.json(resEmotions);
  });
});

app.post('/image',(req,res)=>{
  const {snapSrc} = req.body;
  src = snapSrc;

  let input = {
    "image": src,
    "numResults": 7
  };

  Algorithmia.client(emoKey).algo("deeplearning/EmotionRecognitionCNNMBP/1.0.1").pipe(input).then(function(response) {
    const resEmotions = response.result.results[0].emotions;

    for(let i=0;i<resEmotions.length;i++){
      
      switch(resEmotions[i].label){
        case 'Happy':   emotions.happy = resEmotions[i].confidence;
                        break;

        case 'Neutral': emotions.neutral = resEmotions[i].confidence;
                        break;

        case 'Disgust': emotions.disgust = resEmotions[i].confidence;
                        break;

        case 'Sad':     emotions.sad = resEmotions[i].confidence;
                        break;

        case 'Fear':    emotions.fear = resEmotions[i].confidence;
                        break;

        case 'Angry':   emotions.angry = resEmotions[i].confidence;
                        break;

        case 'Surprise':emotions.surprise = resEmotions[i].confidence;
                        break;
      }
    }

    foundEmotion = resEmotions[0].label;
    console.log(foundEmotion);

    // console.log(emotionsValue);
  });
});

app.listen(process.env.PORT || 1999, function() {
  console.log("server started on port 1999!");
});