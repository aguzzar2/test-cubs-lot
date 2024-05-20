const express = require('express')
const Author = require('../models/author') //Access to author 
const router = express.Router()


// All Authors Route
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name =  new RegExp(req.query.name, 'i') // Regular Expression 'i' case insensitive
    }
    try{
        const authors = await Author.find(searchOptions)
        res.render('authors/index', { 
            authors: authors,
            searchOptions : req.query
         })
    } catch{
        res.redirect('/')
    }
})

// New Authors Route
router.get('/new', (req, res) => {
    res.render('authors/new', {author: new Author()})
})

// Creating the Author
router.post('/', async (req, res) => {
    const author = new Author ({
        name: req.body.name
    })
    try{
        const newAuthor = await author.save() // await is async
        res.redirect(`authors`)
    }catch {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating author'
        })
    }
}) // Post for Creation

module.exports = router