'use strict';

const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();
var knex = require('../knex')
var humps = require('humps')

router.get('/', (req, res, next) => {
  // res.send('GET all books')
  knex('books')
    .select('*')
    .then((rows) => rows.sort((title1, title2) => title1.title.toUpperCase() > title2.title.toUpperCase()))
    .then((rows) => rows.map((data) => humps.camelizeKeys(data)))
    .then((rows) => {
      res.json(rows)
    })
    .catch((err) => console.log(err))
})

router.get('/:id', (req, res, next) => {
  const { id } = req.params
  knex('books')
    .select('*')
    .where('id', id)
    .then(rows => {
      if (rows.length > 0) {
        res.json(humps.camelizeKeys(rows[0]))
      } else {
        res.sendStatus(404)
      }
    })
})

router.post('/', (req, res, next) => {
  const { title, author, genre, description, coverUrl } = req.body
  const cover_url = humps.decamelizeKeys(coverUrl)
  knex('books')
    .insert({
      title, author, genre, description, cover_url
    })
    .returning('*')
    .then((rows) => {
      if (rows.length > 0) {
        res.json(humps.camelizeKeys(rows[0]))
      } else {
        res.sendStatus(404)
      }
    })
    .catch((err) => console.log(err))
})

router.patch('/:id', (req, res, next) => {
  const { id } = req.params
  const { title, author, genre, description, coverUrl } = req.body
  const cover_url = humps.decamelizeKeys(coverUrl)
  knex('books')
    .update({ title, author, genre, description, cover_url })
    .where('id', id)
    .returning('*')
    .then((rows) => {
      res.json(humps.camelizeKeys(rows[0]))
    })
    .catch((err) => console.log(err))
})

router.delete('/:id', (req, res, next) => {
  const { id } = req.params
  knex('books')
  .del()
  .where('id', id)
  .returning(['title', 'author', 'genre', 'description', 'cover_url'])
  .then((rows) => {
    res.json(humps.camelizeKeys(rows[0]))
  })
  .catch((err) => console.log(err))
})


// router.delete('/:id', (req, res, next) => {
//   const { id } = req.params
//
//   knex(bookTable)
//     .del()
//     .where('id', id)
//     .returning('*')
//     .then((rows) => {
//       res.type('json')
//       res.json(humps.camelizeKeys(rows[0]))
//     })
//     .catch((err) => console.log(err))
// })

module.exports = router;
