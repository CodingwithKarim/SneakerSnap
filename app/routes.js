module.exports = function(app, passport, db, ObjectId, multer) {

// normal routes ===============================================================
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/uploads')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + ".png")
  }
});
var upload = multer({storage: storage}); 

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
      let userID = ObjectId(req.user._id)
        db.collection('makePost').find({postedBy: userID }).toArray((err, result) => {
          if (err) return console.log(err)
          res.render('profile.ejs', {
            user : req.user,
            price: result,
            messages: result
          })
        })
    });

    //PROFILE PAGE
    
    

    // FEED =====================
    app.get('/feed', isLoggedIn, function(req, res) {
      db.collection('makePost').find().toArray((err, result) => {
        if (err) return console.log(err)
        res.render('feed.ejs', {
          user : req.user,
          messages: result
        })
      })
  });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// Post Page ===============================================================
app.get('/post/:postComments', isLoggedIn, function (req, res) {
  console.log('params', req.params);
  let postId = ObjectId(req.params.postComments);
  console.log('objectId', postId);
  db.collection('makePost')
    .find({
      _id: postId,
    })
    .toArray((err, result) => {
      if (err) return console.log(err);
      db.collection('comments')
        .find({
          postId: postId,
        })
        .toArray((err, result02) => {
          res.render('post.ejs', {
            user: req.user,
            posts: result,
            comments: result02,
          });
        });
    });
});
//profile page
app.get('/page/:id', isLoggedIn, function (req, res) {
  let params = req.params.id;
  console.log(params);
  let postId = ObjectId(params);
  db.collection('makePost')
    .find({ postedBy: postId })
    .toArray((err, result) => {
      if (err) return console.log(err);
      res.render('page.ejs', {
        posts: result,
      });
    });
});

app.post('/comment/:postComments', (req, res) => {

  let postId = ObjectId(req.params.postComments);

  db.collection('comments').save(
    { comment: req.body.comment, postId: postId },
    (err, result) => {
      if (err) return console.log(err);
      console.log('saved to database');
      res.redirect(`/post/${postId}`);
    }
  );
});

// message board routes ===============================================================

    app.post('/upload', upload.single('file-to-upload'), (req, res) => {
      db.collection('makePost').save({caption: req.body.caption,price: req.body.price, img: 'images/uploads/' + req.file.filename, postedBy: req.user._id, likes: 0}, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/profile')
      })
    })

    app.put('/messages', (req, res) => {
      let testID = ObjectId(req.body.postID)
      console.log(testID)
      db.collection('makePost')
      .findOneAndUpdate({_id: testID}, {
        $set: {
          likes: req.body.likes + 1,
          comment: req.body.comment
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    app.delete('/deletePost', (req, res) => {
    let key = ObjectId(req.body.key)
      db.collection('makePost').findOneAndDelete({_id: key }, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/feed', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/feed', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
