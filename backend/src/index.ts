import express from 'express'
import mysql from 'mysql2/promise'

const app = express()
const port = Number(process.env.PORT ?? 3000)

app.use(express.json())

const database = mysql.createPool({
  host: process.env.DB_HOST ?? 'db',
  port: Number(process.env.DB_PORT ?? 3306),
  database: process.env.DB_NAME ?? 'job_board',
  user: process.env.DB_USER ?? 'job_board_user',
  password: process.env.DB_PASSWORD ?? 'dev_password_change_me',
  connectionLimit: 5,
})

app.get('/api/health', async (_request, response) => {
  try {
    await database.query('SELECT 1')
    response.json({ status: 'ok', database: 'connected' })
  } catch {
    response.status(503).json({ status: 'error', database: 'unavailable' })
  }
})

app.get('/api/ads', async (_request, response) => {
  try {
    const [ads] = await database.query(`
      SELECT
        ads.id,
        ads.title,
        companies.name AS name_company,
        ads.one_sentence_description,
        ads.full_description,
        ads.wages,
        ads.place,
        ads.working_time,
        ads.advantages,
        ads.diploma_needed
      FROM ads
      INNER JOIN companies ON companies.id = ads.company_id
      ORDER BY ads.id DESC
    `)

    response.json(ads)
  } catch {
    response.status(500).json({
      message: 'Impossible de récupérer les annonces.',
    })
  }
})

app.listen(port, '0.0.0.0', () => {
  console.log(`API listening on port ${port}`)
})
