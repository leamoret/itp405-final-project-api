var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var app = express();
var Piece = require('./models/piece');
var Comment = require('./models/comment');
var Artist = require('./models/artist');

var Validator = require('validatorjs');
var validUrl = require('valid-url');

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
  var promise = Piece.findAll();
  promise.then(function(pieces) {
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

//post a comment
app.post('/api/v1/comments', function(req,res) {
  var body = req.body;

  //validate
  var validation = new Validator({
    content: body.content ,
    piece_id: body.piece_id
  }, {
    content: 'required',
    piece_id: 'required|integer'
  });

  if(validation.passes()) {
    Comment.create({
      content: body.content,
      piece_id: body.piece_id
    }).then(function(comment) {
      res.json(comment)
      console.log(comment)
    }).catch(function(error) {
      console.log(error)
      res.json({
        error: "There was an error. Comment not created."
      })
    });
  }
  else {
    res.json({
      error: "Appropriate information not provided."
    })
  }
});


//post a piece
app.post('/api/v1/pieces', function(req,res) {
  var body = req.body;

  //validate
  var validation = new Validator({
    title: body.title ,
    price: body.price,
    artist_id: body.artist_id,
    photo_url: body.photo_url
  }, {
    title: 'required',
    artist_id: 'required|integer'
  });

  if(validation.passes()) {
    if (validUrl.isUri(body.photo_url)){
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
        res.json({
          error: "There was an error. Piece not created."
        })
      });
    } else {
        res.json({
          error: 'Please provide a valid url for the photo url.'
        })
    }
  }
  else {
    res.json({
      error: "Appropriate information not provided."
    })
  }
});

//post an artist
app.post('/api/v1/artists', function(req,res) {
  var body = req.body;

  var validation = new Validator({
    name: body.name,
    age: body.age,
    biography: body.biography,
    photo_url: body.photo_url
  }, {
    name: 'required',
    age: 'required'
  });

  if(validation.passes()) {
    if (validUrl.isUri(body.photo_url)){
      Artist.create({
        name: body.name,
        age: body.age,
        biography: body.biography,
        photo_url: body.photo_url
      }).then(function(artist) {
        res.json(artist)
        console.log(artist)
      }).catch(function(error) {
        res.json({
          error: "There was an error. Artist was not added."
        })
        console.log(error);
      });
    } else {
      res.json({
        error: 'Please provide a valid url for the photo url.'
      })
    }
  }
  else {
    console.log("Appropriate information not provided.")
    res.json({
      error: "Appropriate information not provided."
    })
  }

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

//find one piece by id with comments
app.get('/api/v1/pieces/:id', function(req,res) {
  var promise = Piece.findById(req.params.id);
  promise.then(function(piece) {
    if(!piece) {
      return res.json({
        error: 'Piece not found.'
      })
    }
    Comment.findAll({
      where: {
        piece_id: req.params.id
      }
    }).then(function(comments) {
      res.json({
        piece: {
          piece: piece,
          comments: comments
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
    var info = false;
    var body = req.body;
    if(body.name) {
      artist.name = body.name;
      info = true;
    }
    if(body.age) {
      artist.age = body.age;
      info = true;
    }
    if(body.biography) {
      artist.biography = body.biography;
      info = true;
    }
    if(body.photo_url) {
      if (! validUrl.isUri(body.photo_url)) {
        res.json({
          error: "Please provide a valid url for the photo url."
        })
      } else {
        artist.photo_url = body.photo_url;
        info = true;
      }
    }
    if(body.endorsement) {
      artist.endorsement = body.endorsement;
      info = true;
    }
    if(!info) {
      res.json({
        error: "There is nothing to update."
      })
    }
    //save update
    artist.save().then(function(updated_artist) {
      res.json(updated_artist)
    }).catch(function(error) {
      console.log(error);
      res.json({
        error: "There was an error. Artist not updated."
      })
    })
  }).catch(function(error) {
    console.log(error);
    res.json({
      error: "There was an error. Artist not updated."
    })
  })
});


//update a piece
app.put('/api/v1/pieces/:id', function(req,res) {
  var promise = Piece.findById(req.params.id);
  promise.then(function(piece) {
    if(!piece) {
      return res.json({
        error: 'Piece not found.'
      })
    }
    var info = false;
    var body = req.body;
    if(body.title) {
      piece.title = body.title;
      info = true;
    }
    if(body.price) {
      piece.price = body.price;
      info = true;
    }
    if(body.photo_url) {
      if (! validUrl.isUri(body.photo_url)) {
        res.json({
          error: "Please provide a valid url for the photo url."
        })
      }
      piece.photo_url = body.photo_url;
      info = true;
    }
    if(!info) {
      res.json({
        error: "There is nothing to update."
      })
    }
    //save update
    piece.save().then(function(updated_piece) {
      res.json(updated_piece)
    }).catch(function(error) {
      console.log(error);
      res.json({
        error: "There was an error. Piece not updated."
      })
    })
  }).catch(function(error) {
    console.log(error);
    res.json({
      error: "There was an error. Piece not updated."
    })
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
      res.json({
        error: "There was an error. Piece not deleted."
      })
    })
  }).catch(function(error) {
    console.log(error);
    res.json({
      error: "There was an error. Piece not deleted."
    })
  })
});

//delete artist and all its pieces
app.delete('/api/v1/artists/:id', function(req,res) {
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
          res.json({
            error: "There was an error. Artist not deleted."
          })
        })
      })
    }).catch(function() {
      console.log(error);
    })
    artist.destroy()
    .then(function() {
      console.log('Artist is deleted!')
      res.json('Artist is deleted');
    }).catch(function(error) {
      console.log(error);
      res.json({
        error: "There was an error. Artist not deleted."
      })
    })
  }).catch(function(error) {
    console.log(error);
    res.json({
      error: "There was an error. Artist not deleted."
    })
  })
});
