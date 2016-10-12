var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var User = require('../models/User.js');
var Post = require('../models/Post.js');
var auth = require('./mymiddleware.js');
var fs = require('fs');
var path = require('path');

router.get('/', function (req, res) {
	Post.find({}).populate('author').sort('-create_date').exec(function(err, posts){
        if(err) return next(err);
        res.render('index', {
            'posts': posts,
            title: 'Simple Forum',
            user: req.user,
        });
        //console.log(req.body);
    });
});

router.get('/signup', function(req, res) {
		res.render('./users/signup', {title: 'SignUp'});
});

router.post('/signup', function(req, res) {
		User.register(new User({ username : req.body.username }), req.body.password, function(err, account) {
				if (err) {
					req.session.message.error.push('' + err);
					return res.render('./users/signup', { account: account });	
				}

				passport.authenticate('local')(req, res, function() {
					req.session.message.info.push('Signup success! Please login first!');
					res.redirect('/login');
				});
		});
});

router.get('/login', function(req, res, next) {
		res.render('./users/login', { user : req.user });
});

router.post('/login', passport.authenticate('local', {successRedirect: '/', failureFlash: 'Invalid username or password.'}), function(req, res) {

});

router.get('/logout', function(req, res) {
		req.logout();
		res.redirect(req.get('referer'));
});

/* GET /users/:id */
router.get('/profile/:id', function(req, res, next) {
	User.findById(req.params.id, function (err, result) {
		if (err){
			return next(new Error('Not found!'));
		} else{
			if(req.user){
				var check = false;
				if(result._id.equals(req.user._id)) check = true;
			}
			res.render('./users/profile', {
			title: 'View Profile',
			result: result,
			check: check,
			user: req.user
		});
		}
	});
});

/*GET changeinfo */
router.get('/updateprofile/:id', auth.isLogged, function(req, res, next){
	User.findById(req.params.id, function(err, user){
		if(err){
			return next(new Error('Not found!'));
		} else{
			if(user._id.equals(req.user._id)){
				res.render('./users/update', {
					title: 'Update Profile',
					user: user,
				});
			} else{
				req.session.message.error.push('Access Denied! Redirect to Home');
				res.redirect('/posts');
			}
		}
	});
});


/* POST /changeinfo/ */
router.post('/updateprofile', auth.isLogged,function(req, res, next) {
	User.findById(req.user._id, function (err, user) {
		if(!user){
			console.log('Edit Fail');
			return next(new Error('Not found this user!'));
		} else{
			user.display_name = req.body.display_name;
			user.address = req.body.address;
			user.save(function(err){
				if(err){
					//console.log('Error while saving user');
					req.session.message.error.push('Edit user failed. Please try again!');
					res.redirect('/updateprofile');
				} else{
					//console.log('Edit user success!');
					req.session.message.info.push('Update success!');
					res.redirect('/profile/' + user._id);
				}
			});
		} 
	});
});

/* DELETE /users/:id */
router.delete('/delete/:id', function(req, res, next) {
	User.findByIdAndRemove(req.params.id, req.body, function(err, user){
		//req.session.message.info.push('Delete user success!');
		res.send((err === null) ? {msg: ''} : {msg: 'Error' + err});
		//res.json(post);
	});
});

router.get('/userlist', function(req, res, next){
	User.find(function(err, users){
		if(err) return next(err);
		res.json(users);
	});
});

router.get('/manageraccount', function(req, res, next){
	res.render('./users/userlist', {
		title: 'Manager Account',
		user: req.user
	});
});


module.exports = router;
