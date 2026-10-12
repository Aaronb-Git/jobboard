import express from 'express'
import mysql from 'mysql2/promise'
import {ResultSetHeader} from 'mysql2'
import type {RowDataPacket} from 'mysql2'
import * as argon2 from 'argon2';
import session from 'express-session'

const sessionSecret = process.env.SESSION_SECRET
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

if(sessionSecret === "" || sessionSecret === undefined){
  throw new Error("SESSION_SECRET manquant");
}

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie : {
    httpOnly: true,
    sameSite: 'lax',
    secure: false
  }
}))
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
interface LoginUser extends RowDataPacket {
  id : number,
  password_hash : string | null,

}
interface AdRow extends RowDataPacket {
  id : number
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

app.post('/api/login', async(request, response)=> {
  const {email, password} = request.body;

    if(typeof email != "string" || typeof password != "string"){
      return response.status(400).json({message : "Format invalide"});
    }

    const cleanedE = email.trim();

    if (cleanedE === "" || password === ""){
      return response.status(400).json({message : "Champ obligatoire"});
    }
    try{
      const[rows] = await database.execute<LoginUser[]>(`
        SELECT id,
        password_hash
        FROM users
        WHERE email = ?`,[cleanedE])
        if(rows.length === 0){
          return response.status(401).json({message : "Email ou mot de passe incorrect"})
        }
        const user = rows[0];
        if(user.password_hash === null){
          return response.status(401).json({message : "Email ou mot de passe incorrect"})
        }
        const isValid = await argon2.verify(user.password_hash, password)
        if(!isValid){
          return response.status(401).json({message : "Email ou mot de passe incorrect"})
        }

        request.session.regenerate((error)=>{
          if(error){
            return response.status(500).json({message : "Impossible de se connecter"})
          }
          request.session.userId = user.id
          
          request.session.save((saveError)=>{
          if(saveError){
            return response.status(500).json({message : "Impossible de se connecter"})
          }
          return response.status(200).json({message : "Connexion réussie"})
          })
        })
    }catch{
      response.status(500).json({
        message : "Impossible de se connecter"
      })
    }
});

app.get('/api/me',(request, response)=>{
  if(!request.session.userId){
    return response.status(401).json({message : "Non connecté"})
  }
  return response.status(200).json({id : request.session.userId})
});

app.post('/api/logout', (request,response)=>{
  request.session.destroy((error)=> {
    if(error){
      return response.status(500).json({message : "impossible de se deconnecter"});
    }
    response.clearCookie('connect.sid', {path:'/'})
    return response.status(200).json({message : "Déconnexion réussie"})
  })
});

app.post('/api/ads/:id/applications', async (request, response)=>{
  if(!request.session.userId){
    return response.status(401).json({message : "Connectez-vous pour postuler"})
  }

  const adId = Number(request.params.id)
  if(!Number.isInteger(adId) || adId < 1){
    return response.status(400).json({ message : "Identifiant d'annonce invalide"})
  }
  const msg = request.body.message
  if(typeof msg != "string"){
    return response.status(400).json({ message: "Format invalide"})
  }
  const cleanedMessage = msg.trim();
  
  try{
    const [row] = await database.execute<AdRow[]>(`
      SELECT id
      FROM ads
      WHERE id = ?`, [adId])
      if(row.length === 0){
        return response.status(404).json({message : "Annonce introuvable"})
      }else{
        const [result] = await database.execute<ResultSetHeader>(`
          INSERT INTO applications
          (ad_id,
          user_id,
          message)
          VALUES (?,?,?)
          `, [adId,request.session.userId, cleanedMessage])
          response.status(201).json({id : result.insertId, message : "Candidature enregistrée"})
      }
  }catch{
    response.status(500).json({message : "Impossible de postuler"})
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`API listening on port ${port}`)
});
