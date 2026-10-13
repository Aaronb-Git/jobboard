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
interface CurrentUserRow extends RowDataPacket {
  id : number,
  is_admin : number
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

app.get('/api/me', async(request, response)=>{
  if(!request.session.userId){
    return response.status(401).json({message : "Non connecté"})
  }
  try{
    const [res] = await database.execute<CurrentUserRow[]>(`
      SELECT id,
      is_admin
      FROM  users
      WHERE id = ?`, [request.session.userId])
      if(res.length === 0){
        return response.status(401).json({message : "Non connecté"})
      }else {
        const user = res[0];
        response.status(200).json({id : user.id, is_admin : user.is_admin===1})
      }
  }catch{
    response.status(500).json({
        message : "Impossible de récuperer l'utilisateur connecté"
    })
  }
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

//-----------------------------------------------------Company----------------------------------------------------------------------------


app.get('/api/companies', async (_request, response) => {
  try{

    const [companies] = await database.query("SELECT * FROM companies")
    response.json(companies)

  }catch{
    response.status(500).json({message : "Impossible de récupérer les entreprises"})
  }
})


app.post('/api/companies', async (request, response) => {
  const { name, company_description } = request.body;
  try {
    if (typeof name !== "string") {
      return response.status(400).json({ message: "Format invalide" });
    }

    const cleanedN = name.trim();

    if (cleanedN === "") {
      return response.status(400).json({ message: "Champ obligatoire" });
    }
    if (cleanedN !== name) {
      return response.status(400).json({ message: "Vous avez mis des espace inutile" });
    }

    const [resultat] = await database.execute<ResultSetHeader>("INSERT INTO companies (name, company_description) VALUES (?, ?);",[name,company_description ?? null]);
    return response.status(201).json({id: resultat.insertId, message: "Entreprise créée avec succès"});



  } catch {
    return response.status(500).json({ message: "Impossible de créer l'entreprise" });
  }
});

app.put('/api/companies/:id', async (request, response) => {
  const { name, company_description } = request.body;
  const id = Number(request.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return response.status(400).json({ message: "ID invalide" });
  }

  if (typeof name !== "string" || name.trim() === "") {
    return response.status(400).json({ message: "Nom invalide" });
  }

  try {
    const [resultat] = await database.execute<ResultSetHeader>("UPDATE companies SET name = ?, company_description = ? WHERE id = ?",[name.trim(), company_description ?? null, id]);

    if (resultat.affectedRows === 0) {
      return response.status(404).json({ message: "Entreprise introuvable" });
    }

    return response.status(200).json({id: id,message: "Entreprise modifiée avec succès"});

  } catch {
    return response.status(500).json({message: "Impossible de modifier l'entreprise"});
  }
});


app.delete('/api/companies/:id', async (request, response) => {
  const id = Number(request.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return response.status(400).json({ message: "ID invalide" });
  }
  try {
    const [resultat] = await database.execute<ResultSetHeader>("DELETE FROM companies WHERE id = ?",[id]);

    if (resultat.affectedRows === 0) {
      return response.status(404).json({message: "Entreprise introuvable"});
    }
    return response.status(200).json({id: id,message: "Entreprise supprimé avec succès"});


  } catch {
    return response.status(500).json({message: "Impossible de supprimer l'entreprise"});
  }

});

//----------------------------------------------------------------users------------------------------------------------------------------

app.get('/api/users', async (request, response) => {
  if(!request.session.userId){
    return response.status(401).json({message : "Non connecté"})
  }
  try{
    const [res] = await database.execute<CurrentUserRow[]>(`
      SELECT id,
      is_admin
      FROM users
      WHERE id = ?`, [request.session.userId])

      if(res.length === 0 || res[0].is_admin !== 1){
        return response.status(403).json({message : "Accés interdit"})
      }
    const [users] = await database.query("SELECT id, name, firstname, email, phone, address, is_admin FROM users;")
    response.json(users)

  }catch{
    response.status(500).json({message : "Impossible de récupérer les utilisateurs"})
  }
})

app.put('/api/users/:id', async (request, response) => {
  const { name, firstname, email, phone, address } = request.body;
  const id = Number(request.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return response.status(400).json({ message: "ID invalide" });
  }

  if (
    typeof name !== "string" || name.trim() === "" ||
    typeof firstname !== "string" || firstname.trim() === "" ||
    typeof email !== "string" || email.trim() === ""
  ) {
    return response.status(400).json({ message: "Champs invalides" });
  }

  if (
    (phone != null && typeof phone !== "string") ||
    (address != null && typeof address !== "string")
  ) {
    return response.status(400).json({ message: "Format invalide" });
  }

  if (!request.session.userId) {
    return response.status(401).json({ message: "Non connecté" });
  }

  try {
    // Vérifier que l'utilisateur est propriétaire du compte ou administrateur
    if (request.session.userId !== id) {
      const [admins] = await database.execute<(RowDataPacket & { is_admin: number })[]>("SELECT is_admin FROM users WHERE id = ?",[request.session.userId]);

      if (admins.length === 0 || !admins[0].is_admin) {
        return response.status(403).json({ message: "Accès interdit" });
      }
    }

    const [resultat] = await database.execute<ResultSetHeader>(`UPDATE users SET name = ?, firstname = ?, email = ?, phone = ?, address = ? WHERE id = ?`,
      [name.trim(), firstname.trim(), email.trim(), phone ?? null, address ?? null, id]
    );

    if (resultat.affectedRows === 0) {
      return response.status(404).json({message: "Utilisateur introuvable"});
    }

    return response.status(200).json({id: id,message: "Utilisateur modifié avec succès"});

  } catch {
    return response.status(500).json({message: "Impossible de modifier l'utilisateur"});
  }
});


app.delete('/api/users/:id', async (request, response) => {
  const id = Number(request.params.id);

  // Vérification de l'ID
  if (!Number.isInteger(id) || id <= 0) {
    return response.status(400).json({message: "ID invalide"});
  }

  // Vérification de la connexion
  if (!request.session.userId) {
    return response.status(401).json({message: "Non connecté"});
  }

  try {
    // Vérification des droits si l'utilisateur supprime un autre compte
    if (request.session.userId !== id) {
      const [admins] = await database.execute<(RowDataPacket & { is_admin: number })[]>("SELECT is_admin FROM users WHERE id = ?", [request.session.userId]);

      if (admins.length === 0 || !admins[0].is_admin) {
        return response.status(403).json({message: "Accès interdit"});
      }
    }

    // Suppression de l'utilisateur
    const [resultat] = await database.execute<ResultSetHeader>("DELETE FROM users WHERE id = ?", [id]);

    if (resultat.affectedRows === 0) {
      return response.status(404).json({message: "Utilisateur introuvable"});
    }

    // Déconnexion si l'utilisateur supprime son propre compte
    if (request.session.userId === id) {
      return request.session.destroy((error) => {
        if (error) {
          return response.status(500).json({message: "Compte supprimé, mais erreur de déconnexion"});
        }

        response.clearCookie('connect.sid');
        return response.status(200).json({id: id, message: "Compte supprimé et déconnexion réussie"});
      });
    }

    return response.status(200).json({id: id, message: "Utilisateur supprimé avec succès"});

  } catch (error: any) {
    // Utilisateur lié à des candidatures
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return response.status(409).json({message: "Impossible de supprimer cet utilisateur car il possède des candidatures"});
    }

    return response.status(500).json({message: "Impossible de supprimer l'utilisateur"});
  }
});

//-------------------------------------------------------------------------ads-------------------------------------------------------------------------------------------

app.post('/api/ads', async (request, response) => {
  const { title, company_id, one_sentence_description, full_description, wages, place, working_time, advantages, diploma_needed } = request.body;

  // Vérification des champs obligatoires
  if (typeof title !== "string" || title.trim() === "") {
    return response.status(400).json({message: "Titre invalide"});
  }

  if (!Number.isInteger(company_id) || company_id <= 0) {
    return response.status(400).json({message: "ID entreprise invalide"});
  }

  // Vérification des droits administrateur
  if (!request.session.userId) {
    return response.status(401).json({message: "Non connecté"});
  }

  try {
    const [admins] = await database.execute<(RowDataPacket & { is_admin: number })[]>("SELECT is_admin FROM users WHERE id = ?", [request.session.userId]);

    if (admins.length === 0 || !admins[0].is_admin) {
      return response.status(403).json({message: "Accès interdit"});
    }

    // Insertion de l'annonce
    const [resultat] = await database.execute<ResultSetHeader>(
      `INSERT INTO ads (title, company_id, one_sentence_description, full_description, wages, place, working_time, advantages, diploma_needed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, company_id, one_sentence_description ?? null, full_description ?? null, wages ?? null, place ?? null, working_time ?? null, advantages ?? null, diploma_needed ?? null]
    );

    return response.status(201).json({id: resultat.insertId, message: "Annonce créée avec succès"});

  } catch (error: any) {
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return response.status(400).json({message: "Entreprise introuvable"});
    }

    return response.status(500).json({message: "Impossible de créer l'annonce"});
  }
});


app.put('/api/ads/:id', async (request, response) => {
  const id = Number(request.params.id);
  const { title, company_id, one_sentence_description, full_description, wages, place, working_time, advantages, diploma_needed } = request.body;

  // Vérification de l'ID et des champs obligatoires
  if (!Number.isInteger(id) || id <= 0) {
    return response.status(400).json({message: "ID invalide"});
  }

  if (typeof title !== "string" || title.trim() === "") {
    return response.status(400).json({message: "Titre invalide"});
  }

  if (!Number.isInteger(company_id) || company_id <= 0) {
    return response.status(400).json({message: "ID entreprise invalide"});
  }

  // Vérification de la connexion
  if (!request.session.userId) {
    return response.status(401).json({message: "Non connecté"});
  }

  try {
    // Vérification des droits administrateur
    const [admins] = await database.execute<(RowDataPacket & { is_admin: number })[]>("SELECT is_admin FROM users WHERE id = ?", [request.session.userId]);

    if (admins.length === 0 || !admins[0].is_admin) {
      return response.status(403).json({message: "Accès interdit"});
    }

    // Modification de l'annonce
    const [resultat] = await database.execute<ResultSetHeader>(
      `UPDATE ads
       SET title = ?, company_id = ?, one_sentence_description = ?, full_description = ?, wages = ?, place = ?, working_time = ?, advantages = ?, diploma_needed = ?
       WHERE id = ?`,
      [title, company_id, one_sentence_description ?? null, full_description ?? null, wages ?? null, place ?? null, working_time ?? null, advantages ?? null, diploma_needed ?? null, id]
    );

    if (resultat.affectedRows === 0) {
      return response.status(404).json({message: "Annonce introuvable"});
    }

    return response.status(200).json({id: id, message: "Annonce modifiée avec succès"});

  } catch (error: any) {
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return response.status(400).json({message: "Entreprise introuvable"});
    }

    return response.status(500).json({message: "Impossible de modifier l'annonce"});
  }
});


app.delete('/api/ads/:id', async (request, response) => {
  const id = Number(request.params.id);

  // Vérification de l'ID
  if (!Number.isInteger(id) || id <= 0) {
    return response.status(400).json({message: "ID invalide"});
  }

  // Vérification de la connexion
  if (!request.session.userId) {
    return response.status(401).json({message: "Non connecté"});
  }

  try {
    // Vérification des droits administrateur
    const [admins] = await database.execute<(RowDataPacket & { is_admin: number })[]>("SELECT is_admin FROM users WHERE id = ?", [request.session.userId]);

    if (admins.length === 0 || !admins[0].is_admin) {
      return response.status(403).json({message: "Accès interdit"});
    }

    // Suppression de l'annonce
    const [resultat] = await database.execute<ResultSetHeader>("DELETE FROM ads WHERE id = ?", [id]);

    if (resultat.affectedRows === 0) {
      return response.status(404).json({message: "Annonce introuvable"});
    }

    return response.status(200).json({id: id, message: "Annonce supprimée avec succès"});

  } catch (error: any) {
    // Annonce liée à des candidatures
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return response.status(409).json({message: "Impossible de supprimer cette annonce car elle possède des candidatures"});
    }

    return response.status(500).json({message: "Impossible de supprimer l'annonce"});
  }
});

//-------------------------------------------------------------------applications------------------------------------------------------------------------

app.get('/api/applications', async (request, response) => {
  // Vérification de la connexion
  if (!request.session.userId) {
    return response.status(401).json({message: "Non connecté"});
  }

  try {
    // Vérification des droits administrateur
    const [admins] = await database.execute<(RowDataPacket & { is_admin: number })[]>("SELECT is_admin FROM users WHERE id = ?", [request.session.userId]);

    if (admins.length === 0 || !admins[0].is_admin) {
      return response.status(403).json({message: "Accès interdit"});
    }

    // Récupération des candidatures
    const [applications] = await database.query(`SELECT applications.*, users.name, users.firstname, ads.title FROM applications INNER JOIN users ON applications.user_id = users.id INNER JOIN ads ON applications.ad_id = ads.id ORDER BY applications.applied_at DESC`);

    return response.status(200).json(applications);

  } catch {
    return response.status(500).json({message: "Impossible de récupérer les candidatures"});
  }
});



app.post('/api/applications', async (request, response) => {
  const { ad_id, message } = request.body;

  // Vérification de la connexion
  if (!request.session.userId) {
    return response.status(401).json({message: "Non connecté"});
  }

  // Vérification de l'annonce
  if (!Number.isInteger(ad_id) || ad_id <= 0) {
    return response.status(400).json({message: "ID annonce invalide"});
  }

  if (message != null && typeof message !== "string") {
    return response.status(400).json({message: "Message invalide"});
  }

  try {
    // Création de la candidature
    const [resultat] = await database.execute<ResultSetHeader>(
      "INSERT INTO applications (ad_id, user_id, message) VALUES (?, ?, ?)",
      [ad_id, request.session.userId, message ?? null]
    );

    return response.status(201).json({id: resultat.insertId, message: "Candidature créée avec succès"});

  } catch (error: any) {
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return response.status(400).json({message: "Annonce ou utilisateur introuvable"});
    }

    return response.status(500).json({message: "Impossible de créer la candidature"});
  }
});



app.put('/api/applications/:id', async (request, response) => {
  const id = Number(request.params.id);
  const { message } = request.body;

  // Vérification de l'ID et du message
  if (!Number.isInteger(id) || id <= 0) {
    return response.status(400).json({message: "ID invalide"});
  }

  if (message != null && typeof message !== "string") {
    return response.status(400).json({message: "Message invalide"});
  }

  if (!request.session.userId) {
    return response.status(401).json({message: "Non connecté"});
  }

  try {
    // Récupération du propriétaire de la candidature
    const [applications] = await database.execute<(RowDataPacket & { user_id: number })[]>("SELECT user_id FROM applications WHERE id = ?", [id]);

    if (applications.length === 0) {
      return response.status(404).json({message: "Candidature introuvable"});
    }

    // Vérification des droits
    if (applications[0].user_id !== request.session.userId) {
      const [admins] = await database.execute<(RowDataPacket & { is_admin: number })[]>("SELECT is_admin FROM users WHERE id = ?", [request.session.userId]);

      if (admins.length === 0 || !admins[0].is_admin) {
        return response.status(403).json({message: "Accès interdit"});
      }
    }

    // Modification du message
    await database.execute<ResultSetHeader>("UPDATE applications SET message = ? WHERE id = ?", [message ?? null, id]);

    return response.status(200).json({id: id, message: "Candidature modifiée avec succès"});

  } catch {
    return response.status(500).json({message: "Impossible de modifier la candidature"});
  }
});




app.delete('/api/applications/:id', async (request, response) => {
  const id = Number(request.params.id);

  // Vérification de l'ID
  if (!Number.isInteger(id) || id <= 0) {
    return response.status(400).json({message: "ID invalide"});
  }

  if (!request.session.userId) {
    return response.status(401).json({message: "Non connecté"});
  }

  try {
    // Récupération du propriétaire de la candidature
    const [applications] = await database.execute<(RowDataPacket & { user_id: number })[]>("SELECT user_id FROM applications WHERE id = ?", [id]);

    if (applications.length === 0) {
      return response.status(404).json({message: "Candidature introuvable"});
    }

    // Vérification des droits
    if (applications[0].user_id !== request.session.userId) {
      const [admins] = await database.execute<(RowDataPacket & { is_admin: number })[]>("SELECT is_admin FROM users WHERE id = ?", [request.session.userId]);

      if (admins.length === 0 || !admins[0].is_admin) {
        return response.status(403).json({message: "Accès interdit"});
      }
    }

    // Suppression de la candidature
    const [resultat] = await database.execute<ResultSetHeader>("DELETE FROM applications WHERE id = ?", [id]);

    if (resultat.affectedRows === 0) {
      return response.status(404).json({message: "Candidature introuvable"});
    }

    return response.status(200).json({id: id, message: "Candidature supprimée avec succès"});

  } catch {
    return response.status(500).json({message: "Impossible de supprimer la candidature"});
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`API listening on port ${port}`)
});
