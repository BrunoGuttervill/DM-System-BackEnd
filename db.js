import mysql from 'mysql2/promise'
import 'dotenv/config'


const db = await mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    database: 'dany_massas',
    password: process.env.DB_PASSWORD,
    dateStrings: true,
    decimalNumbers: true

})

export default db;