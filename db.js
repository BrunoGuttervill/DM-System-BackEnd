import mysql from 'mysql2/promise'
import 'dotenv/config'

let db
try {
  db = await mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    database: 'dany_massas',
    password: process.env.DB_PASSWORD,
    dateStrings: true,
    decimalNumbers: true
  })
  await db.query('SELECT 1')
  console.log('Conectado ao banco com sucesso!')
} catch (err) {
  console.error('ERRO AO CONECTAR NO BANCO:', err)
}

export default db