const { request } = require('express')

const Pool = require('pg').Pool
const pool = new Pool({
    user: 'teokri',
    host: 'localhost',
    database: 'test',
    password: '',
    port: 5432,
})

const getUsers = (request, response) => {
    pool.query('SELECT * FROM users ', (error, results) => {
      if (error) {
        throw error
      }
      response.json(results.rows)
    })
  }

  const postUser = (request, response) => {
    
  }

  

module.exports = {
    getUsers,
    pool
}    


