// Userlist data array for filling in info box
var myPostData = [];
var myUserData = [];
// DOM Ready =============================================================
$(document).ready(function() {
	// Username link click
	$('#postList table tbody').on('click', 'td a.linkshowuser', showUserInfo);
	// Populate the user table on initial page load
	populateTable_Post();
	populateTable_User();
	populate_myPost();
	// Add User button click
	$('#btncreatePost').on('click', createPost);
	// Delete User link click
    $('#postList table tbody').on('click', 'td a.btn.btn-danger', deletePost);
    $('#userList table tbody').on('click', 'td a.btn.btn-danger', deleteUser);
    $('#myPost table tbody').on('click', 'td a.btn.btn-danger', deletePost);

});

// Functions =============================================================

// Fill table with data
function populateTable_Post() {

	// Empty content string
	var tableContent = '';

	// jQuery AJAX call for JSON
	$.getJSON('/posts/data', function(data) {
		// Stick our user data array into a userlist variable in the global object
		myPostData = data;
		// For each item in our JSON, add a table row and cells to the content string
		$.each(data, function(){
			tableContent += '<tr>'
			tableContent += '<td><a href="/posts/view/' + this._id + '">' + this.title + '</a></td>';
			tableContent += '<td><a href="/posts/view/' + this._id + '" class="btn btn-info">View</a></td>';
			tableContent += '<td><a href="/posts/edit/' + this._id + '" class="btn btn-success">Edit</a></td>';
			tableContent += '<td><a href="/posts/delete/' + this._id + '" class="btn btn-danger" rel="' + this._id + '">Delete</a></td>';
			tableContent += '</tr>'
		});

		// Inject the whole content string into our existing HTML table
		$('#postList table tbody').html(tableContent);
	});
};

// Fill table with data
function populateTable_User() {

	// Empty content string
	var tableContent = '';

	// jQuery AJAX call for JSON
	$.getJSON('/userlist', function(data) {
		// Stick our user data array into a userlist variable in the global object
		myUserData = data;
		// For each item in our JSON, add a table row and cells to the content string
		$.each(data, function(){
			tableContent += '<tr>'
			tableContent += '<td><a href="/user/' + this._id + '">' + this.username + '</a></td>';
			tableContent += '<td><a href="/user/' + this._id + '" class="btn btn-info">View</a></td>';
			tableContent += '<td><a href="/changeinfo/' + this._id + '" class="btn btn-success">Edit</a></td>';
			tableContent += '<td><a href="/delete/' + this._id + '" class="btn btn-danger" rel="' + this._id + '">Delete</a></td>';
			tableContent += '</tr>'
		});

		// Inject the whole content string into our existing HTML table
		$('#userList table tbody').html(tableContent);
	});
};

// Show User Info
function showUserInfo(event) {

	// Prevent Link from Firing
	event.preventDefault();

	// Retrieve username from link rel attribute
	var thisUserName = $(this).attr('rel');

	// Get Index of object based on id value
	var arrayPosition = userListData.map(function(arrayItem) { return arrayItem.username; }).indexOf(thisUserName);

	// Get our User Object
	var thisUserObject = userListData[arrayPosition];

	//Populate Info Box
	$('#userInfoName').text(thisUserObject.fullname);
	$('#userInfoAge').text(thisUserObject.age);
	$('#userInfoGender').text(thisUserObject.gender);
	$('#userInfoLocation').text(thisUserObject.location);

};

// Add User
function createPost(event) {
	event.preventDefault();

	// Super basic validation - increase errorCount variable if any fields are blank
	var errorCount = 0;
	$('#createPost input').each(function(index, val) {
		if($(this).val() === '') { errorCount++; }
	});

	// Check and make sure errorCount's still at zero
	if(errorCount === 0) {

		// If it is, compile all user info into one object
		var newpost = {
			'author': $('#createPost .form-group #author').val(),
			'title': $('#createPost .form-group input#titlePost').val(),
			'content': $('#createPost .form-group textarea#contentPost').val().replace(/\n/g, '<br/>'),
			'category': $('#createPost .form-group select#category').val(),

		}

		// Use AJAX to post the object to our adduser service
		$.ajax({
			type: 'POST',
			data: newpost,
			url: '/posts/create',
			dataType: 'JSON'
		}).done(function(response) {

			// Check for successful (blank) response
			if (response.msg === '') {

				// Clear the form inputs
				$('#createPost input').val('');
				$('#createPost textarea').val('');

				// Update the table
				populateTable_Post();
				$(location).attr('href', 'localhost:3000/posts')

			}
			else {

				// If something goes wrong, alert the error message that our service returned
				alert('Error: ' + response.msg);

			}
		});
	}
	else {
		// If errorCount is more than 0, error out
		alert('Vui lòng điền đầy đủ các trường');
		return false;
	}
};

// Delete Post
function deletePost(event) {

    event.preventDefault();

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this post?');

    // Check and make sure the user confirmed
    if (confirmation === true) {

        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/posts/delete/' + $(this).attr('rel')
        }).done(function(response) {

            // Check for a successful (blank) response
            if(response.msg === ''){
            	populateTable_Post();
            	populate_myPost();
            } else{
            	alert('Error: ' + response.msg);
            }
            
        });

    }
    else {

        // If they said no to the confirm, do nothing
        return false;

    }

};

//function DELETE User
function deleteUser(event) {

    event.preventDefault();

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this user?');

    // Check and make sure the user confirmed
    if (confirmation === true) {

        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/delete/' + $(this).attr('rel')
        }).done(function(response) {

            // Check for a successful (blank) response
            if(response.msg === ''){
            	// Update the table
            	//window.location.replace("localhost:3000/posts");
            	populateTable_User();
            } else{
            	alert('Error: ' + response.msg);
            }
            
        });

    }
    else {

        // If they said no to the confirm, do nothing
        return false;

    }

};

function populate_myPost() {

	// Empty content string
	var tableContent = '';

	// jQuery AJAX call for JSON
	$.getJSON('/posts/mypost', function(data) {
		// Stick our user data array into a userlist variable in the global object
		//myPostData = data;
		// For each item in our JSON, add a table row and cells to the content string
		$.each(data, function(){
			tableContent += '<tr>'
			tableContent += '<td><a href="/posts/view/' + this._id + '">' + this.title + '</a></td>';
			tableContent += '<td><a href="/posts/view/' + this._id + '" class="btn btn-info">View</a></td>';
			tableContent += '<td><a href="/posts/edit/' + this._id + '" class="btn btn-success">Edit</a></td>';
			tableContent += '<td><a href="/posts/delete/' + this._id + '" class="btn btn-danger" rel="' + this._id + '">Delete</a></td>';
			tableContent += '</tr>'
		});

		// Inject the whole content string into our existing HTML table
		$('#myPost table tbody').html(tableContent);
	});
};