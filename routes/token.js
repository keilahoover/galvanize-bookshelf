'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex')
const humps = require('humps')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const boom = require('boom')

router.get('/', (req, res, next) => {
  const { token } = req.cookies
  if (token) {
    const decode = jwt.decode(token)
    knex('users')
      .select(['first_name', 'last_name', 'email', 'id'])
      .where('email', decode.data)
      .then((rows) => {
        res.status(200).json(true)
      })
      .catch((err) => console.log(err));
  } else {
    res.status(200).json(false)
  }
})

router.post('/', (req, res, next) => {
  const { email, password } = req.body
  knex('users')
    .select('*')
    .where('email', email)
    .then((rows) => {
      if (rows.length > 0) {
          return rows[0]
        } else {
        next(boom.badRequest('Bad email or password'))
      }
    })
    .then((userData) => {
      bcrypt.compare(password, userData.hashed_password, (err, result) => {
        if (err) {
          console.log(err)
        } else {
          if (result) {
            const token = jwt.sign({data: email}, password)
            const encryptData = {
              first_name: userData.first_name,
              last_name: userData.last_name,
              email: userData.email,
              id: userData.id
            }
            res.setHeader('Set-Cookie', `token=${token}; Path=\/; +HttpOnly`)
            res.status(200).json(humps.camelizeKeys(encryptData))
          } else {
            next(boom.badRequest('Bad email or password'))
          }
        }
      })
      })
    .catch((err) => console.log(err))
})

router.delete('/', (req, res, next) => {
  res.setHeader('Set-Cookie', `token=; Path=\/; +HttpOnly`)
  res.status(200).json(true)
})

module.exports = router;
