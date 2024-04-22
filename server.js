const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const _ = require('lodash');
const chalk = require('chalk');

const app = express();
const PORT = process.env.PORT || 3000;

// Arreglo para almacenar los usuarios registrados
let registeredUsers = [];

// Middleware para permitir JSON en las solicitudes
app.use(express.json());

// Ruta raíz, redirige al usuario a las rutas /registro y /usuarios
app.get('/', (req, res) => {
    res.send(`
        <h1>Bienvenido al sistema de registro de usuarios</h1>
        <p>Para registrar usuarios, visite <a href="/registro">/registro</a></p>
        <p>Para ver la lista de usuarios registrados, visite <a href="/usuarios">/usuarios</a></p>
    `);
});

// Ruta para registrar usuarios
app.get('/registro', async (req, res) => {
    try {
        // Obtener 10 usuarios de la API
        const response = await axios.get('https://randomuser.me/api/?results=10');
        const users = response.data.results.map(user => ({
            // Campos utilizados
            name: user.name,
            gender: user.gender,
            id: uuidv4(),
            timestamp: moment().format('MMMM Do YYYY, h:mm:ss a')
        }));

        // Agregar los usuarios al arreglo de usuarios registrados
        registeredUsers.push(...users);

        // Lista de usuarios en la consola con fondo blanco y color de texto azul
        console.log(chalk.bgWhite.blue('Lista de Usuarios Registrados:'));
        console.log(chalk.bgWhite.blue(JSON.stringify(registeredUsers, null, 2)));

        res.status(200).send(`
            <h1>Usuarios registrados exitosamente</h1>
            <p>${users.length} usuarios han sido registrados.</p>
        `);
    } catch (error) {
        console.error('Error al registrar usuarios:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// Ruta para obtener todos los usuarios registrados
app.get('/usuarios', (req, res) => {
    try {
        // Dividir los usuarios por sexo utilizando Lodash
        const usersByGender = _.groupBy(registeredUsers, 'gender');

        // Lista de usuarios en la consola con fondo blanco y color de texto azul
        console.log(chalk.bgWhite.blue('Lista de Usuarios Registrados:'));
        console.log(chalk.bgWhite.blue(JSON.stringify(usersByGender, null, 2)));

        // Se muestra en HTML
        let htmlResponse = '<h1>Usuarios registrados</h1>';
        Object.keys(usersByGender).forEach(gender => {
            htmlResponse += `<h2>${gender === 'male' ? 'Hombres' : 'Mujeres'}</h2>`;
            usersByGender[gender].forEach(user => {
                htmlResponse += `<p> Nombre: ${user.name.first} ${user.name.last} | ID: ${user.id} | Timestamp: ${user.timestamp}</p>`;
            });
        });

        res.status(200).send(htmlResponse);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// Servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
