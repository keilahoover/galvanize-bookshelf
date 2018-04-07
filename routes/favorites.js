'use strict';

const express = require('express');
const knex = require('../knex');
const boom = require('boom')
const humps = require('humps')
const jwt = require('jsonwebtoken')
const router = express.Router();

router.use(isAuthorized)

router.get('/', (req, res, next) => {
  knex('favorites')
    .innerJoin('books', 'books.id', 'favorites.book_id')
    .select('*')
    .then((rows) => rows.map((data) => humps.camelizeKeys(data)))
    .then((rows) => {
      res.json(rows)
    })
    .catch((err) => console.log(err))
})

router.get('/check', (req, res, next) => {
  const bookId = req.query.bookId
  knex('favorites')
    .select('*')
    .where('book_id', bookId)
    .then((rows) => {
      if (rows.length > 0) {
        res.json(true)
      } else {
        res.json(false)
      }
    })
})

router.post('/', (req, res, next) => {
  const { bookId } = req.body
  knex('favorites')
    .insert({
      book_id: bookId,
      user_id: req.userId
    })
    .returning('*')
    .then((result) => {
      res.json(humps.camelizeKeys(result[0]))
    })
})

router.delete('/', (req, res, next) => {
  const { bookId } = req.body
  knex('favorites')
    .del()
    .returning(['book_id', 'user_id'])
    .where('book_id', bookId)
    .then((rows) => {
      return rows.map((data) => humps.camelizeKeys(data))
    })
    .then((result) => {
      res.json(result[0])
    })
    .catch((err) => console.log(err))
})


function isAuthorized(req, res, next) {
  const token = req.cookies.token
  if (token) {
    const decode = jwt.decode(token)
    knex('users')
      .select('id')
      .where('email', decode.data)
      .then((rows) => {
        if (rows.length === 1) {
          req.userId = rows[0].id
          next()
        }
        else {
          next(boom.badRequest('Email must be unique'))
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }
  else {
    next(boom.unauthorized())
  }
}

module.exports = router;
