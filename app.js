require('dotenv').config()
const bodyParser = require('body-parser')
const express = require('express');

// Inicializa la aplicación de Express
const app = express();
// Middleware: Convierte el cuerpo de las peticiones JSON en objetos JS (req.body)
app.use(bodyParser.json());
// Middleware: Procesa datos enviados desde formularios HTML (permite objetos anidados con extended: true)
app.use(bodyParser.urlencoded({ extended: true }));

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

app.listen(PORT, () =>{
    console.log(`Servidor: http://localhost:${PORT}`);
})