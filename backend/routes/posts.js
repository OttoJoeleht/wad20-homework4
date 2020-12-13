const express = require('express');
const router = express.Router();
const authorize = require('../middlewares/authorize');
const PostModel = require('../models/PostModel');


router.get('/', authorize, (request, response) => {

    // Endpoint to get posts of people that currently logged in user follows or their own posts

    PostModel.getAllForUser(request.currentUser.id, (postIds) => {

        if (postIds.length) {
            PostModel.getByIds(postIds, request.currentUser.id, (posts) => {
                response.status(201).json(posts)
            });
            return;
        }
        response.json([])

    })

});

router.post('/', authorize,  (request, response) => {

    // Endpoint to create a new post

    let postData = {
        userId: request.currentUser.id,
        text: request.body.text,
        media: {
            type: request.body.media.type,
            url: request.body.media.url
        }
    }

    if (!postData.text) {
        response.json({
            code: "missing_text",
            message: "Please provide text"
        }, 400)

        return;
    }

    if(postData.media){
        if(typeof postData.media != "object"){
            response.json({
                code: "malformed_media",
                message: "Please provide properly formated media object"
            }, 400)
    
            return;
        }
    }
    
    PostModel.create(postData, () => {
        response.status(200).json()
    })

});


router.put('/:postId/likes', authorize, (request, response) => {

    // Endpoint for current user to like a post
    const userID=request.currentUser.id;
    const postID=request.params.postId;

    PostModel.getLikesByUserIdAndPostId(userID, postID, (likes) => {
        
        if (likes.length == 0) {
            PostModel.like(userID, postID, () => {
                response.status(200).json()
            })
        } 
          
    })
    
});

router.delete('/:postId/likes', authorize, (request, response) => {

    // Endpoint for current user to unlike a post
    const userID=request.currentUser.id;
    const postID=request.params.postId;

    PostModel.getLikesByUserIdAndPostId(userID, postID, (likes) => {

        if (likes.length > 0) {
            PostModel.unlike(userID, postID, () => {
                response.status(200).json()
            })
        } 
          
    })

});

module.exports = router;
