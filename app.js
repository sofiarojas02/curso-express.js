require('dotenv').config()
const bodyParser = require('body-parser')
const express = require('express');
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Inicializa la aplicación de Express
const app = express();
// Middleware: Convierte el cuerpo de las peticiones JSON en objetos JS (req.body)
app.use(bodyParser.json());
// Middleware: Procesa datos enviados desde formularios HTML (permite objetos anidados con extended: true)
app.use(bodyParser.urlencoded({ extended: true }));

const authenticateToken = require('./src/middlewares/auth')

//permite trabajar con el sistema de archivos de node
const fs = require('fs')
const path = require('path') //manjear las rutas de los archivos
const userFilePath =  path.join(__dirname,'users.json')


//middleware logger
const LoggerMiddleware = require('./src/middlewares/logger')
app.use(LoggerMiddleware)

//middleware errorhandler
const errorHandler = require('./src/middlewares/errorHandler')
app.use(errorHandler)

const PORT = process.env.PORT || 3000;
console.log(PORT)

app.get('/', (req, res) => {
    res.send(`
        <h1>Curso Express.js v3</h1>
        <p>Esto es una aplicacion nodejs con express.js</p>
        <p>Corre en el puerto: ${PORT}</p>
        `)
});

app.get('/users/:id', (req, res) => {
    const userId = req.params.id  
    res.send(`Mostrar informacion del usuario con ID: ${userId}`)
})

app.get('/search', (req, res)=>{
    const terms = req.query.termino || 'No especificado'
    const category = req.query.categoria || 'Todas'

    res.send(`
        <h2>Resultados de Busqueda:</h2>
        <p>Termino: ${terms}</p>
        <p>Categoria: ${category}</p>
        `)
})

app.post('/form',(req, res) => {
    const name = req.body.nombre || 'Anonimo';
    const email = req.body.email || 'No proporcionado';

    res.json({
        message: 'Datos recividos',
        data: {
            name,
            email
        }
    })
})

app.post('/api/data', (req,res) => {
    const data = req.body;

    if(!data || Object.keys(data).length ===0){
        return res.status(400).json({error: 'No se recibieron datos'})
    }

    res.status(201).json({
        message: 'Datos json recibidos',
        data,
    })
})

app.get('/users', (req, res) => {
    fs.readFile(userFilePath, 'utf-8', (err, data)=> {
        if(err){
            return res.status(500).json({error: 'Error con la conexion de datos'})
        }
        const users = JSON.parse(data)
        res.json(users)
    })
})

app.post('/users', (req, res) => {
    const newUser = req.body;
    fs.readFile(userFilePath, ('utf-8'), (err, data) => {
        if(err){
            return res.status(500).json({error: 'Error con la conexion de datos'})
        }
        const users = JSON.parse(data) //convertir texto en arreglo para poder hacer push
        users.push(newUser)
        fs.writeFile(userFilePath, JSON.stringify(users, null , 2), (err) =>{
            if(err){
            return res.status(500).json({error: 'Error al guardar el usuario'})
            }

            res.status(201).json(newUser)
        })
    })
})

app.put('/users/:id', (req, res) =>{
    const userId = parseInt(req.params.id, 10)
    const updateUser = req.body

    fs.readFile(userFilePath, ('utf-8'), (err, data) =>{
        if(err){
            return res.status(500).json({error: 'Error con la conexion de datos'})
        }

        let users = JSON.parse(data)
        users = users.map(user => 
            user.id === userId ? {...user, ...updateUser} : user)

            fs.writeFile(userFilePath, JSON.stringify(users, null , 2), (err) => {
                if(err){
                    res.status(500).json({error: 'Error para actualizar'})
                }

            res.json(updateUser)

            })
    })
})


app.delete('/users/:id', (req, res) =>{
    const userId = parseInt(req.params.id)
    fs.readFile(userFilePath, 'utf-8', (err, data)=>{
        if(err){
            return res.status(500).json({error: 'Error con la conexion de datos'})
        }

        let users = JSON.parse(data)
        users = users.filter(user => user.id !== userId)

        fs.writeFile(userFilePath, JSON.stringify(users, null, 2), (err)=>{
            if(err){
                    res.status(500).json({error: 'Error al eliminar usuario '})
                }
        })

        res.status(204).send()
    })
})

app.get('/error', (req, res, next) => {
    next(new Error('Error intencional'))
    
})

app.get('/db-users', async (req, res) => {
    try {
        const users = await prisma.user.findMany()
        res.json(users)
    } catch (error) {
        res.status(500).json({error: 'Error para conectarse con la BD'})
    }
}) 

app.get('/protected-route', authenticateToken, (req, res) =>{
    res.send('Esta es una ruta protegida')
})

app.post('/register', async (req, res) => {
    const {email, password, name} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            role: 'USER'
        }
    })

    res.status(201).json({mesage: 'User registered Succesfully'})
})

app.post('/login', async (req, res) =>{
    console.log('BODY RECIBIDO:', req.body);
    const {email, password} = req.body;
    const user = await prisma.user.findUnique({ where: {email}}) ;

    if(!user) return res.status(400).json({error: 'Invalid email or password'})

    const validPassword = await bcrypt.compare(password, user.password);

    if(!validPassword) return res.status(400).json({error: 'Invalid email or password'})

    const token = jwt.sign(
        {id: user.id, 
            role: user.role}, 
        process.env.JWT_SECRET,
        {expiresIn: '4h'}
    );

    res.json({token})
})

app.listen(PORT, () =>{
    console.log(`Servidor: http://localhost:${PORT}`);
})

