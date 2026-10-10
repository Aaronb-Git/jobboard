import express from 'express'
import mysql from 'mysql2/promise'
import ResultSetHeader from 'mysql2'
import * as argon2 from 'argon2';

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

interface User {
  name: string;
  firstname: string;
  email: string;
  password?: string;
}
app.post('/api/users', async(request, response)=>{
  const {name, firstname, email, password} = request.body;

  if(typeof(name) != "string" || typeof(firstname)  != "string"  || typeof(email) != "string" || typeof(password) != "string"){
    return response.status(400).json({message : "Format invalide"});
  }

  let cleandedN = name.trim();
  let cleanedF = firstname.trim();
  let cleanedE = email.trim();

  const user: User = {
  name : cleandedN,
  firstname : cleanedF,
  email : cleanedE,
}

  if(cleanedE === "" || cleandedN === "" || cleanedF === "" || password === ""){
      return response.status(400).json({message : "Champ obligatoire"})
  }
  try {
    const passwordHash =  await argon2.hash(password);
    const[result] = await database.execute<ResultSetHeader>(`
      INSERT INTO users
      (name,
      firstname,
      email,
      password_hash)
      VALUES (?,?,?,?)
      `, [user.name, user.firstname,user.email,passwordHash])

  return response.status(201).json({ id: result.insertId, message : " Compte créer"});
  } catch {
    response.status(500).json({
      message : "Impossible de créer l'utilisateur."
    });
  }

});

app.listen(port, '0.0.0.0', () => {
  console.log(`API listening on port ${port}`)
})
