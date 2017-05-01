var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var app = express();
var Piece = require('./models/piece');
var Artist = require('./models/artist')

app.use(express.static(__dirname + '/public'));
//parse body for json
app.use(bodyParser.json());

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}
app.use(allowCrossDomain);

app.get('/', function(req,res) {
	res.json([]);
});

//get all pieces
app.get('/api/v1/pieces', function(req,res) {
  var promise = Piece.findAll(); //promises can be fulfilled, rejected, or pending
  promise.then(function(pieces) { //resolved
    res.json(pieces);
    console.log('Success getting pieces.')
  }).catch(function(error) {
    console.log(error);
  });
});

//get all artists
app.get('/api/v1/artists', function(req,res) {
  var promise = Artist.findAll();
  promise.then(function(artists) {
    res.json(artists);
    console.log('Sucess getting all artists.')
  }).catch(function(error) {
    console.log(error);
  });
});

//post a piece
app.post('/api/v1/pieces', function(req,res) {
  var body = req.body;
  Piece.create({
    title: body.title,
    price: body.price,
    artist_id: body.artist_id,
    photo_url: body.photo_url
  }).then(function(piece) {
    res.json(piece)
    console.log(piece)
  }).catch(function(error) {
    console.log(error)
  });
});

//post an artist
app.post('/api/v1/artists', function(req,res) {
  var body = req.body;
  Artist.create({
    name: body.name,
    age: body.age,
    biography: body.biography,
    photo_url: body.photo_url
  }).then(function(artist) {
    res.json(artist)
    console.log(artist)
  }).catch(function(error) {
    console.log(error);
  });
});

app.listen(3000, function() {
	console.log("Listening on Port 3000")
});

//find one artist by id with songs
app.get('/api/v1/artists/:id', function(req,res) {
  var promise = Artist.findById(req.params.id);
  promise.then(function(artist) {
    if(!artist) {
      return res.json({
        error: 'Artist not found.'
      })
    }
    Piece.findAll({
      where: {
        artist_id: req.params.id
      }
    }).then(function(pieces) {
      res.json({
        artist: {
          artist: artist,
          pieces: pieces
        }
      });
    });
  }).catch(function(error) {
    console.log(error);
  });
});

//update an artist
app.put('/api/v1/artists/:id', function(req,res) {
  var promise = Artist.findById(req.params.id);
  promise.then(function(artist) {
    if(!artist) {
      return res.json({
        error: 'Artist not found.'
      })
    }
    var body = req.body;
    if(body.name) {
      artist.name = body.name;
    }
    if(body.age) {
      artist.age = body.age;
    }
    if(body.biography) {
      artist.biography = body.biography;
    }
    if(body.photo_url) {
      artist.photo_url = body.photo_url;
    }
    if(body.endorsement) {
      artist.endorsement = body.endorsement;
    }
    //save update
    artist.save(function(error) {
      if(error) {
        res.send(err)
      }
    }).then(function(updated_artist) {
      res.json(updated_artist)
    }).catch(function(error) {
      console.log(error);
    })
  }).catch(function(error) {
    console.log(error);
  })
});

//delete piece
app.delete('/api/v1/pieces/:id', function(req,res) {
  var promise = Piece.findById(req.params.id);
  promise.then(function(piece) {
    if(!piece) {
      return res.json({
        error: 'Piece not found.'
      })
    }
    piece.destroy()
    .then(function() {
      res.json('Piece is deleted');
    }).catch(function(error) {
      console.log(error);
    })
  }).catch(function(error) {
    console.log(error);
  })
});

//delete artist and all its pieces
app.delete('/api/v1/artist/:id', function(req,res) {
  var promise = Artist.findById(req.params.id);
  promise.then(function(artist) {
    if(!artist) {
      return res.json({
        error: 'Artist not found.'
      })
    }
    //delete all pieces by this artist
    Piece.findAll({
      where: {
        artist_id: artist.id
      }
    }).then(function(pieces) {
      pieces.forEach(function (piece) {
        piece.destroy()
        .then(function() {
          console.log('Piece is deleted')
        })
        .catch(function(error) {
          console.log(error);
        })
      })
    }).catch(function() {
      console.log(error);
    })
    artist.destroy()
    .then(function() {
      res.json('Artist is deleted');
    }).catch(function(error) {
      console.log(error);
    })
  }).catch(function(error) {
    console.log(error);
  })
});
