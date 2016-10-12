var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Post = require('../models/Post.js');
var auth = require('./mymiddleware.js');

//GET Home page
router.get('/', function(req, res, next){
    Post.find({}).populate('author').sort('-create_date').exec(function(err, posts){
        if(err) return next(err);
        res.render('./posts/index', {
            'posts': posts,
            title: 'Simple Forum',
            user: req.user,
        });
    });
});

router.get('/data', function(req, res, next){
    Post.find(function(err, posts){
        if(err) return next(err);
        res.json(posts);
    });
});

/* POST addpost Service */
router.post('/create', auth.isLogged, function(req, res) {
    /*req.body.tags = req.body.tags.replace(/(?:\r\n|\r|\n)''/g).split(",").map(function(tag){
        return { "name": tag };
    });*/
    var newPost = new Post(req.body);
    newPost.save(function(err){
        if(err){
            req.session.message.error.push('' + err);
            res.redirect('/posts/create');
        } else{
            req.session.message.info.push('Congratulations! Create post success!');
            res.redirect('/posts');
        }
        
    });
});

//GET addpost
router.get('/create', auth.isLogged,function(req, res){
    res.render('./posts/add',{
        title: 'Create New Post',
        user: req.user
    });
});
 

//GET View detail a post
router.get('/view/:id', function(req, res){
    Post.findById(req.params.id).populate('author').exec(function(err, post){
        if(err){
            res.send(404, 'Not Found this post! Try again');
        } else{
            res.render('./posts/view', {
                "post": post,
                title: 'Detail Post',
                user: req.user
            });
            //console.log(req);
        }
    });
});

router.post('/view', function(req, res, next){
    Post.findById(req.body.id, function(err, post){
    if(!post){
         return next(new Error('Error! Try again'));
    } else{
        var comment = {
            author : req.body.author,
            content: req.body.content,
            date : Date.now()
        };
        post.comments.push(comment);
        post.save(function(err){
            if(err){
                req.session.message.error.push('Failed. Please try again!' + err);
                //console.log('Error');

            } else{
                //console.log(req);
                //req.session.message.info.push('Comment success!');
                res.redirect(req.get('referer'));
            }
        });
    }
  });
});

/* GET /posts/edit/:id */
router.get('/edit/:id', auth.isLogged ,function(req, res, next) {
  Post.findById(req.params.id).populate('author').exec(function (err, post) {
    if (err){
        res.send('Not Found!');
    } else{
        if(!post.author._id.equals(req.user._id)){
            req.session.message.error.push('You are not the author of this post');
            res.redirect('/posts');
        } else{
            res.render('./posts/edit', {
                "post": post,
                title: 'Edit Post',
                user: req.user
            });
        }
        //console.log(req);
    }
  });
});

/* POST /posts/edit/:id */
router.post('/edit', auth.isLogged,function(req, res, next) {
  Post.findById(req.body.id, function(err, post){
    if(!post){
         return next(new Error('Not found this post!'));
    } else{
        post.title = req.body.title;
        post.content = req.body.content;
        post.modified_date = Date.now();
        post.category = req.body.category;
        post.save(function(err){
            if(err){
                req.session.message.error.push('Edit failed. Please try again!' + err);
                //console.log('Error');

            } else{
                //console.log(req);
                req.session.message.info.push('Edit success!');
                res.redirect('/posts');
            }
        });
    }
  });
});
/*
 * DELETE to deletePost.
 */
router.delete('/delete/:id', auth.isLogged, function(req, res, next) {
    Post.findById(req.params.id).populate('author').exec(function(err, post){
        if (err){
            res.send('Not Found!');
        } else{
            if(!post.author._id.equals(req.user._id)){
                res.send({msg: 'You are not the author of this post. You can only delete your own posts!'});
                //res.redirect('back');
            } else{
                post.remove();
                res.send({msg: ''});
            }
        }
    });
});

router.get('/user/:id', function(req, res, next){
    res.render('./posts/userpost', {
        title: 'Manager My Post',
        user: req.user
    });
});

router.get('/mypost', auth.isLogged ,function(req, res, next){
    Post.find().populate({
        path: 'author',
        match: {
            _id: req.user._id
        }
    }).sort('-create_date').exec(function(err, posts){
        if(err) return next(err);
        posts = posts.filter(function(post){
            return post.author;
        });
        res.json(posts);
    });
});

router.get('/category/:name', function(req, res, next){
    Post.find({'category':req.params.name}).exec(function(err, posts){
        if(err){
            res.send('Not Found!')
        } else{
            res.render('./posts/category',{
                title: 'Category ' + req.params.name,
                user: req.user,
                posts: posts
            });
        }
    });
});

module.exports = router;