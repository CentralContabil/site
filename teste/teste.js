const express = require('express');
const app = express();
const port = 21035; // Trocar pela porta definida no painel
// Rota principal da aplicação
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Aplicação Node.js</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                text-align: center;
                background: linear-gradient(to right, #1E3C72, #2A5298);
                color: white;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
            }
            .container {
                background: rgba(255, 255, 255, 0.2);
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
            }
            h1 {
                font-size: 2.5rem;
                margin-bottom: 10px;
            }
            p {
                font-size: 1.3rem;
            }
            .btn {
                display: inline-block;
                margin-top: 15px;
                padding: 12px 25px;
                color: white;
                background: #FF5733;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                transition: background 0.3s;
            }
            .btn:hover {
                background: #C70039;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1> :foguete: Aplicação Node.js</h1>
            <p>Rodando em NodeJS versão <strong>${process.version}</strong></p>
            <a href="/teste" class="btn">Testar Rota</a>
        </div>
    </body>
    </html>
    `);
});
// Rota de teste
app.get('/teste', (req, res) => {
    res.send(`Esta aplicação está rodando em NodeJS versão ${process.version}`);
});
// Iniciando o servidor
app.listen(port, () => {
    console.log('App rodando na porta ' + port);
});