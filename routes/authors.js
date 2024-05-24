const express = require('express')
const Author = require('../models/author') //Access to author 
const Book = require('../models/book')
const router = express.Router()



// All Authors Route
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name =  new RegExp(req.query.name, 'i') // Regular Expression 'i' case insensitive
    }
    try {
        const authors = await Author.find(searchOptions)
        res.render('authors/index', { 
            authors: authors,
            searchOptions : req.query
         })
    } catch {
        res.redirect('/')
    }
})

// New Authors Route
router.get('/new', (req, res) => {
    res.render('authors/new', {author: new Author()})
})

// Create Author Route
router.post('/', async (req, res) => {
    const author = new Author ({
        name: req.body.name
    })
    try{
        const newAuthor = await author.save() // await is async
        res.redirect(`authors/${newAuthor.id}`)
    }catch {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating author'
        })
    }
}) // Post for Creation

router.get('/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        const books = await Book.find( {author: author.id }).limit(6).exec()
        res.render('authors/show', {
            author: author,
            booksByAuthor: books
        })
    } catch {
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', { author: author })

    } catch {
        console.log('Error Creating Edit Page')
        res.redirect('/authors')
    }
    
})

// Creating Author
router.put('/:id', async (req, res) => {
    let author
    try{
        author = await Author.findById(req.params.id)
        author.name = req.body.name
        await author.save() // await is async
        res.redirect(`/authors/${author.id}`) // backslash because we need full URL
    }catch {
        if (author == null) {
            res.redirect('/')
        }
        res.render('authors/edit', {
            author: author,
            errorMessage: 'Error updating author'
        })
    }
})

router.delete('/:id', async (req, res) => {
    let author
    try{
        author = await Author.findById(req.params.id)
        await author.deleteOne() // remove() is deprecated
        res.redirect('/authors')
    }catch {
        if (author == null) {
            res.redirect('/')
        } else {
            res.redirect(`/authors/${author.id}`)
        }
    }
}) // Get dangerous, delete safe need form to work tho



module.exports = router