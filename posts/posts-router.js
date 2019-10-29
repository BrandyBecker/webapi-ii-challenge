const router = require('express').Router();
const db = require('../data/db.js');
//-----------------------------------------------------------------------------------------------------------------------------------------
//GET: /api/db/
//- `find()`: calling find returns a promise that resolves to an array of all the `db` contained in the database.
/* When the client makes a `GET` request to `/api/db`:
- If there's an error in retrieving the _db_ from the database:
  - cancel the request.
  - respond with HTTP status code `500`.
  - return the following JSON object: `{ error: "The posts information could not be retrieved." }`. */
router.get('/', (req,res)=>{
    db.find(req.query)
    .then(posts=>{
        res.status(200).json(posts)
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            error: "The posts' information couldn't be retrieved..."
        })
    })
})
//----------------------------------------------------------------------------------------------------------------------------------------
//GET: /api/posts/:id
//- `findById()`: this method expects an `id` as it's only parameter and returns
// the post corresponding to the `id` provided or an empty array if no post with that `id` is found.
/* When the client makes a `GET` request to `/api/posts/:id`:
- If the _post_ with the specified `id` is not found:
  - return HTTP status code `404` (Not Found).
  - return the following JSON object: `{ message: "The post with the specified ID does not exist." }`.
- If there's an error in retrieving the _post_ from the database:
  - cancel the request.
  - respond with HTTP status code `500`.
  - return the following JSON object: `{ error: "The post information could not be retrieved." }`. */
router.get('/:id', (req,res)=>{
    db.findById(req.params.id)
    .then(post => {
        ((post) ? res.status(200).json(post) : res.status(404).json({message: "The post with the specified ID does not exist." }) )
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            error: "The post information could not be retrieved."
        })
    })
})
//----------------------------------------------------------------------------------------------------------------------------------------
//GET: /api/posts/:id/comments
// - `findPostComments()`: the findPostComments accepts a `postId` as its first parameter and returns all comments 
// on the post associated with the post id.
/* When the client makes a `GET` request to `/api/posts/:id/comments`:
- If the _post_ with the specified `id` is not found:
  - return HTTP status code `404` (Not Found).
  - return the following JSON object: `{ message: "The post with the specified ID does not exist." }`.
- If there's an error in retrieving the _comments_ from the database:
  - cancel the request.
  - respond with HTTP status code `500`.
  - return the following JSON object: `{ error: "The comments information could not be retrieved." }`. */
router.get('/:id/comments', (req,res)=>{
    db.findPostComments(req.params.id)
    .then(post => {
        ( (!post) ? res.status(404).json({ message:"The post with the specified ID does not exist."}) : res.status(200).json(post) )
    })
    .catch(err => {
        res.status(500).json({error: "The comments information could not be retrieved."})
    })
})
//----------------------------------------------------------------------------------------------------------------------------------------
//POST: /api/posts
/* When the client makes a `POST` request to `/api/posts`:
- If the request body is missing the `title` or `contents` property:
  - cancel the request.
  - respond with HTTP status code `400` (Bad Request).
  - return the following JSON response: `{ errorMessage: "Please provide title and contents for the post." }`.
- If the information about the _post_ is valid:
  - save the new _post_ the the database.
  - return HTTP status code `201` (Created).
  - return the newly created _post_.
- If there's an error while saving the _post_:
  - cancel the request.
  - respond with HTTP status code `500` (Server Error).
  - return the following JSON object: `{ error: "There was an error while saving the post to the database" }`. */
  router.post('/', (req, res) => {
    const post = req.body;
    if (!post.title || !post.contents)
    {
        res.status(400).json({
            errorMessage: "Please provide title and contents for the post."
        })
    } else {
    db.insert(post)
    .then(post => {
        res.status(201).json(post);
    })
    .catch(err => {
        res.status(500).json({
            error: "There was an error while saving the post to the database"
        })
    })
}
})

//POST: /api/posts/:id/comments
/* When the client makes a `POST` request to `/api/posts/:id/comments`:
- If the _post_ with the specified `id` is not found:
  - return HTTP status code `404` (Not Found).
  - return the following JSON object: `{ message: "The post with the specified ID does not exist." }`.
- If the request body is missing the `text` property:
  - cancel the request.
  - respond with HTTP status code `400` (Bad Request).
  - return the following JSON response: `{ errorMessage: "Please provide text for the comment." }`.
- If the information about the _comment_ is valid:
  - save the new _comment_ the the database.
  - return HTTP status code `201` (Created).
  - return the newly created _comment_.
- If there's an error while saving the _comment_:
  - cancel the request.
  - respond with HTTP status code `500` (Server Error).
  - return the following JSON object: `{ error: "There was an error while saving the comment to the database" }`. */
router.post('/:id/comments', (req, res) => {
    const comment = {text: req.body.text, post_id: req.params.id};

   db.findById(req.params.id)
   .then(post => {
       if (post) {
          if (comment.text && comment.post_id) {
              db.insertComment(comment)
              .then(comment => {
                res.status(201).json(comment)
              })
          } else {
              res.status(400).json({
                errorMessage: "Please provide text for the comment."
              })
          }
       } else {
           res.status(404).json({
            message: "The post with the specified ID does not exist."
           })
       }
   })
   .catch(err => {
       res.status(500).json({
        error: "There was an error while saving the comment to the database"
       })
   })
})
//----------------------------------------------------------------------------------------------------------------------------------------
//PUT: /api/posts/:id
/* When the client makes a `PUT` request to `/api/posts/:id`:
- If the _post_ with the specified `id` is not found:
  - return HTTP status code `404` (Not Found).
  - return the following JSON object: `{ message: "The post with the specified ID does not exist." }`.
- If the request body is missing the `title` or `contents` property:
  - cancel the request.
  - respond with HTTP status code `400` (Bad Request).
  - return the following JSON response: `{ errorMessage: "Please provide title and contents for the post." }`.
- If there's an error when updating the _post_:
  - cancel the request.
  - respond with HTTP status code `500`.
  - return the following JSON object: `{ error: "The post information could not be modified." }`.
- If the post is found and the new information is valid:
  - update the post document in the database using the new information sent in the `request body`.
  - return HTTP status code `200` (OK).
  - return the newly updated _post_.
 */
router.put('/:id', (req, res) => {
    const {title, contents} = req.body;
    const id = req.params.id;
    if (!title || !contents) {
        res.status(400).json({
            errorMessage: "Please provide title and contents for the post."
        })
    } else {
        db.update(id, req.body)
        .then(post => {
            if (post) {
                res.status(200).json(post)
            } else {
                res.status(404).json({
                    message: "The post with the specified ID does not exist."
                })
            }
        })
        .catch(() => {
            res.status(500).json({
                error: "The post information could not be modified."
            })
        })
    }
})
//----------------------------------------------------------------------------------------------------------------------------------------
//DELETE: /api/posts/:id
/* When the client makes a `DELETE` request to `/api/posts/:id`:
- If the _post_ with the specified `id` is not found:
  - return HTTP status code `404` (Not Found).
  - return the following JSON object: `{ message: "The post with the specified ID does not exist." }`.
- If there's an error in removing the _post_ from the database:
  - cancel the request.
  - respond with HTTP status code `500`.
  - return the following JSON object: `{ error: "The post could not be removed" }`. */
  router.delete('/:id', (req, res) => {
    const id = req.params.id;
    db.remove(id)
    .then(post => {
        if (post) {
            res.status(200).json({
               message: `Deleted post with id ${id}`
            })
        } else {
            res.status(404).json({
                message: "The post with the specified ID does not exist."
            })
        }
    })
    .catch(err => {
        res.status(500).json({
            error: "The post could not be removed"
        })
    })
})


//export
module.exports = router