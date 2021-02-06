const { request } = require('express')

const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'test',
    password: '43544966',
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



  

module.exports = {
    getUsers,
    pool
}    


