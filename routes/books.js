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
router.get('/new', (req, res) => {
    renderNewPage(res, new Book())
})

// Create Book Route
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
        res.redirect(`books/${newBook.id}`)
    } catch (error) {
        console.error('Error creating book:', error)
        renderNewPage(res, book, true, error.message)
    }
}) // Post for Creation


// Show Book Route
router.get('/:id', async (req,res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author').exec()
        res.render('books/show', { book: book })
    } catch {
        res.redirect('/')
    }
})


// Edit Book Route
router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        renderEditPage(res, book)
    } catch {
        console.log("Edit Book Route")
        res.redirect('/')
    }
})



// Update Book Route
router.put('/:id', async (req, res) => {

    let book 
    try {
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author = req.body.author
        book.publishDate = new Date(req.body.publishDate)
        book.pageCount = req.body.pageCount
        book.description = req.body.description

        if (req.body.cover != null && req.body.cover !== '') {
            saveCover(book, req.body.cover) // Cover Defaults to N
        }
        await book.save()
        res.redirect(`/books/${book.id}`)

    } catch {
        if (book != null) {
            renderEditPage(res, book, true)
        } else {
            redirect('/')
        }
    }
}) // Post for Creation


router.delete('/:id', async (req, res) => {
    let book 
    try {
        book = await Book.findById(req.params.id)
        await book.deleteOne()
        res.redirect('/')
    } catch (err) {
        console.log(err)
        if (book != null) {
            res.render('books/show', {
                book: book,
                errorMessage: 'Could not remove book'
            })
        } else {
            res.redirect('/')
        }
    }
})

function saveCover(book, coverEncoded) {
    if (coverEncoded == null || coverEncoded === '') return;
    try {
        console.log('Received coverEncoded:', coverEncoded); // Log the received data
        const cover = JSON.parse(coverEncoded);
        if (cover != null && imageMimeTypes.includes(cover.type)) {
            book.coverImage = Buffer.from(cover.data, 'base64');
            book.coverImageType = cover.type;
        }
    } catch (error) {
        console.error('Error parsing cover data:', error);
    }
}

async function renderNewPage(res, book, hasError = false) {
    renderFormPage(res, book, 'new', hasError)
}

async function renderEditPage(res, book, hasError = false) {
    renderFormPage(res, book, 'edit', hasError)
}


async function renderFormPage(res, book, form, hasError = false) {
    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) {
            console.log("The form is " + form)
            if (form === 'edit') {
                params.errorMessage = 'Error Updating Book'
            } else {
                params.errorMessage = 'Error Creating Book'
            }
        }
        res.render(`books/${form}`, params)
    } catch (error) {

        res.redirect('/books')
    }
}






module.exports = router
