import express, { response } from 'express';
import path from 'path';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const host = '0.0.0.0';
const porta = 4000;

const app = express();

app.use(express.urlencoded({ extended: true })); 
app.use(session({
    secret: 'secret',
    resave: true, 
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 30
    }
}));

app.use(cookieParser()); 

let navbar =
`
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Index</title>
    <link rel="stylesheet" href="/estilo.css">
</head>
<body>
    <nav class="navbar">
        <a href="menu">Menu</a>
        <a href="/listar">Cadastro</a>
        <a href="/adotar">Adoção</a>
        <a href="/logout">Logout</a>
    </nav>
`;
let Interessados =[];
let Pets = [];
let Adocoes= [];

function usuarioEstaAutenticado(requisicao, resposta, next){
    if (requisicao.session.usuarioAutenticado){
        next(); 
    }
    else{
        resposta.redirect('/login.html');
    }
}

function autenticarUsuario(requisicao, resposta){
    const usuario = requisicao.body.login;
    const senha = requisicao.body.senha;
    if (usuario == 'user' && senha == 'senha'){
        requisicao.session.usuarioAutenticado = true;
        resposta.cookie('ultimoAcesso', new Date().toLocaleString(),{
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 30
        });
        resposta.redirect('/menu');
    }
    else{
  
        let html=
        `   
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login Invalido</title>
        </head>
        <body>
            <p>Usuário ou senha inválidos!</p>
            <a href="/login.html">Voltar</a>
        `;
        if (requisicao.cookies.ultimoAcesso){
            html+=`<p>Seu último acesso foi em ${requisicao.cookies.ultimoAcesso} </p>`;
        }
        html+=
        `
        </body>
        </html>  
        `;
        resposta.send(html);
    }
}

function cadastrarInteresse(requisicao, resposta){
    const nome = requisicao.body.nome;
    const email = requisicao.body.email;
    const telefone = requisicao.body.telefone;
    const acao =  requisicao.body.acao;

    if( nome && email && telefone && acao==="entrar"){
        Interessados.push({
            nome: nome,
            email: email,
            telefone: telefone
        });
        resposta.redirect('/listar');
    }
    else if(acao!="sair"){
        let html = navbar;
        html+= 
        `
        <div class="container">
            <div id="interessado" style="display:block">
                <div class="formulario">
                    <form action="/cadastroInteresse" method="POST">
                    <button class="bttCancelar" id="voltarInteressados" name="acao" value="sair" >x</button>
                        <h2>Cadastro Interessados</h2>
                        <hr>
                        <br>
                        <label for="nome">Nome:</label>
                        <input class="entrada" id="nome" name="nome" type="text" value="${nome}">
        `;
        if(!nome){
            html+=
            `
            <input class="entrada" type="text" value="Nome Inválido!" style="background-color: darkred; color: red;">

            `;
        }
        html+=      
        `
                        <label for="email">Email:</label>
                        <input class="entrada" id="email" name="email" type="email" value="${email}">
        `;
        if(!email){
            html+=
            `
            <input class="entrada" type="text" value="Email Inválido!" style="background-color: darkred; color: red;">

            `;
        }
        html+=
        `
                        <label for="telefone">Telefone:</label>
                        <input class="entrada" id="telefone" name="telefone" type="tel" value="${telefone}">
            `;
        if(!telefone){
            html+=
            `
                <input class="entrada" type="text" value="Telefone Inválido!" style="background-color: darkred; color: red;">
            `;
        }    
        html+=        
            `
                        <button class="bttEnviar" id="enviar" name="acao" value="entrar" >OK</button>
                    </form>
                </div>
            </div>
        </div>
        <script>
        document.addEventListener('DOMContentLoaded', function(){
            const tabelas = document.getElementsByClassName('tabela');

            const abrirInteressado = document.getElementById('botaoInteressado');
            const formInteressado = document.getElementById('interessado');
            const fecharInteressado = document.getElementById('voltarInteressados');

            abrirInteressado.addEventListener('click', function(){
                formInteressado.style.display = 'block';
                for (let i = 0; i < tabelas.length; i++) {
                    tabelas[i].style.display = 'none';
                }
            }, false)
            
            fecharInteressado.addEventListener('click', function(){
                formInteressado.style.display = 'none';
                for (let i = 0; i < tabelas.length; i++) {
                    tabelas[i].style.display = 'block';
                }
            }, false)

            const abrirPets = document.getElementById('botaoPets');
            const formPets = document.getElementById('pet');
            const fecharPets = document.getElementById('voltarPets');

            abrirPets.addEventListener('click', function(){
                formPets.style.display = 'block';
                for (let i = 0; i < tabelas.length; i++) {
                    tabelas[i].style.display = 'none';
                }
            }, false);

            fecharPets.addEventListener('click', function(){
                formPets.style.display = 'none';
                for (let i = 0; i < tabelas.length; i++) {
                    tabelas[i].style.display = 'block';
                }
            }, false);
        }, false)
        </body>
        </html>        
        `;
        resposta.send(html);
        resposta.end();
    }
    else{
        resposta.redirect('/listar');
    }
}

function cadastrarPet(requisicao, resposta){
    const nome = requisicao.body.nome;
    const raca = requisicao.body.raca;
    const idade = requisicao.body.idade;
    const acao = requisicao.body.acao;
    
    if( nome && raca && idade && acao==="entrar"){
        Pets.push({
            nome: nome,
            raca: raca,
            idade: idade
        });
        resposta.redirect('/listar');
    }
    else if(acao!="sair"){
        let html= navbar;
        html+=
        `
        <div class="container">
            <div id="pet" style="display:block">
                <div class="formulario">
                    <form action="/cadastroPet" method="POST">
                    <button class="bttCancelar" id="voltarPets" name="acao" value="sair" >x</button>
                        <h2>Cadastro Pets</h2>
                        <hr>
                        <br>
                        <label for="nome">Nome:</label>
                        <input class="entrada" id="nome" name="nome" type="text" value="${nome}">
        `;
        if(!nome){
            html+=
            `
            <input class="entrada" type="text" value="Nome Inválido!" style="background-color: darkred; color: red;">

            `;
        }
        html+=      
        `
                        <label for="email">Raça:</label>
                        <input class="entrada" id="raca" name="raca" type="text" value="${raca}">
        `;
        if(!raca){
            html+=
            `
            <input class="entrada" type="text" value="Raça Inválida!" style="background-color: darkred; color: red;">

            `;
        }
        html+=
        `
                        <label for="idade">Idade:</label>
                        <input class="entrada" id="idade" name="idade" type="number" value="${idade}">
            `;
        if(!idade){
            html+=
            `
                <input class="entrada" type="text" value="Idade Inválida!" style="background-color: darkred; color: red;">
            `;
        }    
        html+=        
            `
                        <button class="bttEnviar" id="enviar" name="acao" value="entrar" >OK</button>
                    </form>
                </div>
            </div>
        </div>
        <script>
        document.addEventListener('DOMContentLoaded', function(){
            const tabelas = document.getElementsByClassName('tabela');

            const abrirInteressado = document.getElementById('botaoInteressado');
            const formInteressado = document.getElementById('interessado');
            const fecharInteressado = document.getElementById('voltarInteressados');

            abrirInteressado.addEventListener('click', function(){
                formInteressado.style.display = 'block';
                for (let i = 0; i < tabelas.length; i++) {
                    tabelas[i].style.display = 'none';
                }
            }, false)
            
            fecharInteressado.addEventListener('click', function(){
                formInteressado.style.display = 'none';
                for (let i = 0; i < tabelas.length; i++) {
                    tabelas[i].style.display = 'block';
                }
            }, false)

            const abrirPets = document.getElementById('botaoPets');
            const formPets = document.getElementById('pet');
            const fecharPets = document.getElementById('voltarPets');

            abrirPets.addEventListener('click', function(){
                formPets.style.display = 'block';
                for (let i = 0; i < tabelas.length; i++) {
                    tabelas[i].style.display = 'none';
                }
            }, false);

            fecharPets.addEventListener('click', function(){
                formPets.style.display = 'none';
                for (let i = 0; i < tabelas.length; i++) {
                    tabelas[i].style.display = 'block';
                }
            }, false);
        }, false)
        </body>
        </html>        
        `;
        resposta.send(html);
        resposta.end();
    }
    else{
        resposta.redirect("/listar");
    };
}

function cadastrarAdocao(requisicao, resposta){
    const interessado = requisicao.body.Interessados;
    const pet = requisicao.body.Pets;
    const dataAtual = new Date().toLocaleDateString();

    if(interessado && pet){
        Adocoes.push({
            interessado: interessado,
            pet: pet,
            data: dataAtual
        });
        resposta.redirect('/adotar');
    }
    else{}
}



app.post('/login', autenticarUsuario);

app.get('/login', (req,resposta)=>{
    resposta.redirect('/login.html');
});

app.get('/logout', (req, resposta) => {
    req.session.destroy();
    resposta.redirect('/login.html');
});

app.get('/adotar',usuarioEstaAutenticado,(req,resposta)=>{
    let html = navbar;
    html+=
    `
    <div class="container-select">
        <div class="selecao">
            <h2>Formulário de Interesse</h2>
            <form id="formAdocao" action="/adotar" method="POST">
                <label for="Interessados">Interessado:</label><br>
                <select id="Interessados" name="Interessados" value="Interessados">
        `;
    for(let i=0;i<Interessados.length;i++){
        html+=
            `
            <option>${Interessados[i].nome}</option>
            `;
    }
    html+=
        `
                </select>
                <br>
                <label for="Pets">Pet:</label> <br>
                <select id="Pets" name="Pets" value="Pets">
    `;
    for(let i=0;i<Pets.length;i++){
        html+=
        `
        <option>${Pets[i].nome}</option>
        `;
    }
    html+=
        `
                </select>
                <br>
                <input class="btt" id="botao" type="submit" value="Cadastrar">
            </form>
        </div> 
        <div class="resultado">
            <table id="adocao" class="tabela">
                <caption>Interesse de adoção</caption>
                <tr>
                    <th>Interessado</th>
                    <th>Pet</th>
                    <th>Data</th>
                </tr>
                <tbody id="tabelaAdoções">
    `;
    for(let i=0;i<Adocoes.length;i++){
        html+=
        `
        <tr>
            <td>${Adocoes[i].interessado}</td>
            <td>${Adocoes[i].pet}</td>
            <td>${Adocoes[i].data}</td>
        </tr>
        `;
    }
    html+=
    `
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>

    `;
    resposta.send(html);
    resposta.end();
})

app.get('/listar',usuarioEstaAutenticado, (req,resposta)=>{
    let html = navbar;
    html+=
    `
        <div class="container">
            <table class="tabela">
                <tr>
                    <caption>Interessados<button id="botaoInteressado" class="adicionar">+</button></caption>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Telefone</th>
                </tr> 
    `;
    for(let i=0; i<Interessados.length; i++){
        html+=
        `
                <tr>
                    <td>${Interessados[i].nome}</td>
                    <td>${Interessados[i].email}</td>
                    <td>${Interessados[i].telefone}</td>
                </tr>
        `;
    }
    html+=
    `
            </table>
            <div id="interessado">
                <div class="formulario">
                    <form action="/cadastroInteresse" method="POST">
                        <button class="bttCancelar" id="voltarInteressados" name="acao" value="sair" >x</button>
                        <h2>Cadastro Interessados</h2>
                        <hr>
                        <br>
                        <label for="nome">Nome:</label>
                        <input class="entrada" id="nome" name="nome" type="text">
                        <label for="email">Email:</label>
                        <input class="entrada" id="email" name="email" type="email">
                        <label for="telefone">Telefone:</label>
                        <input class="entrada" id="telefone" name="telefone" type="tel">
                        <button class="bttEnviar" id="enviar" name="acao" value="entrar" >OK</button>
                    </form>
                </div>
            </div>
            <table class="tabela">
            <tr>
                <caption>Pets<button id="botaoPets" class="adicionar">+</button></caption>
                <th>Nome</th>
                <th>Raça</th>
                <th>Idade</th>
            </tr>
    `;
    for(let i=0; i<Pets.length; i++){
        html+=
        `
            <tr>
                <td>${Pets[i].nome}</td>
                <td>${Pets[i].raca}</td>
                <td>${Pets[i].idade}</td>
            </tr>
        `;
    }
    html+=
    `
        </table>
        <div id="pet">
            <div class="formulario">
                <form action="/cadastroPet" method="POST">
                <button class="bttCancelar" id="voltarPets" name="acao" value="sair" >x</button>
                    <h2>Cadastro Pets</h2>
                    <hr>
                    <br>
                    <label for="nome">Nome:</label>
                    <input class="entrada" id="nome" name="nome" type="text">
                    <label for="raca">Raça:</label>
                    <input class="entrada" id="raca" name="raca" type="text">
                    <label for="idade">Idade:</label>
                    <input class="entrada" id="idade" name="idade" type="number">
                    <button class="bttEnviar" id="enviar" name="acao" value="entrar" >OK</button>
                </form>
            </div>
        </div>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', function(){
            const tabelas = document.getElementsByClassName('tabela');

            const abrirInteressado = document.getElementById('botaoInteressado');
            const formInteressado = document.getElementById('interessado');
            const fecharInteressado = document.getElementById('voltarInteressados');

            abrirInteressado.addEventListener('click', function(){
                formInteressado.style.display = 'block';
                for (let i = 0; i < tabelas.length; i++) {
                    tabelas[i].style.display = 'none';
                }
            }, false)
            
            fecharInteressado.addEventListener('click', function(){
                formInteressado.style.display = 'none';
                for (let i = 0; i < tabelas.length; i++) {
                    tabelas[i].style.display = 'block';
                }
            }, false)

            const abrirPets = document.getElementById('botaoPets');
            const formPets = document.getElementById('pet');
            const fecharPets = document.getElementById('voltarPets');

            abrirPets.addEventListener('click', function(){
                formPets.style.display = 'block';
                for (let i = 0; i < tabelas.length; i++) {
                    tabelas[i].style.display = 'none';
                }
            }, false);

            fecharPets.addEventListener('click', function(){
                formPets.style.display = 'none';
                for (let i = 0; i < tabelas.length; i++) {
                    tabelas[i].style.display = 'block';
                }
            }, false);
        }, false)
    </script>
</body>
</html>
    `;
    resposta.send(html);
    resposta.end();
});

app.get('/menu',usuarioEstaAutenticado,(req,resposta)=>{
    let html = navbar;
    if (req.cookies.ultimoAcesso){
        html+=
        `<h3>Último acesso foi em : <br> ${req.cookies.ultimoAcesso} </h3>`;
    }
    html+=
    `
    </body>
    </html>
    `;
    resposta.send(html);
});

app.use(express.static(path.join(process.cwd(), 'publico')));

app.use(usuarioEstaAutenticado,express.static(path.join(process.cwd(), 'Protegido')));


app.post('/cadastroInteresse', usuarioEstaAutenticado, cadastrarInteresse);
app.post('/cadastroPet', usuarioEstaAutenticado, cadastrarPet);
app.post('/adotar',usuarioEstaAutenticado,cadastrarAdocao);


app.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
})