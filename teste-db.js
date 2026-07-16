import db from './db.js'

const [rows] = await db.query('SELECT * FROM pizzas')
console.log('Pizzas no banco:', rows)

process.exit(0)