'use strict';

const express = require('express')
const router = express.Router()
const knex = require('../knex')
const humps = require('humps')
const bcrypt = require('bcrypt')
const saltRounds = 10

router.post('/', (req, res, next) => {
  const { firstName, lastName, email, password } = req.body
    bcrypt.hash(password, saltRounds, (err, hash) => {
      console.log(err);
      const first_name = humps.decamelizeKeys(firstName)
      const last_name = humps.decamelizeKeys(lastName)
      const hashed_password = hash
      knex('users')
      .insert({
        first_name, last_name, email, hashed_password
      })
      .returning(['first_name', 'last_name', 'email', 'id'])
      .then((rows) => {
        if (rows.length > 0) {
          res.json(humps.camelizeKeys(rows[0]))
        } else {
          res.sendStatus(404)
        }
      })
      .catch((err) => console.log(err))
    })
})

module.exports = router
