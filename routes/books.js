const express = require('express')
const router = express.Router()
const Book = require('../models/book') //Access to author 
const Author = require('../models/author')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'] // Fixed mime types

// All Book Route
router.get('/', async (req, res) => {
    let query = Book.find({}) // let b/c reassigned 'query'
    if (req.query.title != null && req.query.title != ''){
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != ''){
        query = query.lte('publishDate', req.query.publishedBefore) // .lte = less than equal to
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != ''){
        query = query.gte('publishDate', req.query.publishedAfter) // .gte = greater than equal to
    }
    try{
        const books = await query.exec()
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})

// New Book Route
router.get('/new', async(req, res) => {
    renderNewPage(res, new Book())
})

// Creating the Book
router.post('/', async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate), // some type magic
        pageCount: req.body.pageCount,
        description: req.body.description
    })
    saveCover(book, req.body.cover)
    try {
        const newBook = await book.save()
        res.redirect(`books`)
    } catch (error) {
        console.error('Error creating book:', error)
        renderNewPage(res, book, true, error.message)
    }
}) // Post for Creation


async function renderNewPage(res, book, hasError = false, errorMessage = '') {
    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) {
            params.errorMessage = errorMessage || 'Error Creating Book'
            console.error('Error Creating Book:', errorMessage)
        }
        res.render('books/new', params)
    } catch (error) {
        console.error('Error in renderNewPage:', error)
        res.redirect('/books')
    }
}

function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return;
    try {
        const cover = JSON.parse(coverEncoded);
        if (cover != null && imageMimeTypes.includes(cover.type)) {
            book.coverImage = new Buffer.from(cover.data, 'base64'); // convert to a buffer
            book.coverImageType = cover.type;
        }
    } catch (error) {
        console.error('Error parsing cover data:', error);
    }
}


module.exports = router
