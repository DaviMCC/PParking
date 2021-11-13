function BD ()
{
	process.env.ORA_SDTZ = 'UTC-3';
	
	this.getConexao = async function ()
	{
		if (global.conexao)
			return global.conexao;

        const oracledb = require('oracledb');
        const dbConfig = require('./dbconfig.js');

        oracledb.initOracleClient({libDir: 'D:\Program Files\instantclient_21_3'});
        
        try
        {
		    global.conexao = await oracledb.getConnection({ 
            user: dbConfig.dbuser,
            password: dbConfig.dbpassword,
            connectString: dbConfig.connectString
            });
		}
		catch (erro)
		{
			console.log ('Não foi possível estabelecer conexão com o BD!');
			console.log(erro);
            process.exit(1);
		}

		return global.conexao;
	}

	this.estrutureSe = async function ()
	{
		try
		{
			const conexao = await this.getConexao();
			const sql     = 'CREATE TABLE TICKETS (PLACA VARCHAR2(8) PRIMARY KEY, '+
			                'PLACA VARCHAR2(7) NOT NULL, DATA_ENTRADA DATE NOT NULL,'+
                            'DATA_SAIDA DATE NULL, DATA_PAGAMENTO DATE NULL,' +
                            'STATUS_TICKET VARCHAR(12) NOT NULL, VALOR_ESTADIA VARCHAR(12) NULL);';
			await conexao.execute(sql);
            console.log ('Tabelas criadas com sucesso!');

		}
		catch (erro)
		{
            console.log ('Tabelas já existem!');
            console.log(erro)
        } 
	}
}

function Veiculos (bd)
{
	this.bd = bd;
	
	this.inclua = async function (veiculo)
	{
		const conexao = await this.bd.getConexao();
		
		const sql1 = "INSERT INTO Veiculos (Codigo,Placa,DataEntrada) "+
		             "VALUES (:0,:1,sysdate)";
		const dados = [veiculo.codigo,veiculo.placa];
		console.log(sql1, dados);
		await conexao.execute(sql1,dados);
		
		const sql2 = 'COMMIT';
		await conexao.execute(sql2);	
	}	
	
	this.recupereTodos = async function ()
	{
		const conexao = await this.bd.getConexao();
		
		const sql = "SELECT Codigo,Placa,TO_CHAR(DataEntrada, 'YYYY-MM-DD HH24:MI:SS') "+
		            "FROM Veiculos";
		ret =  await conexao.execute(sql);

		return ret.rows;
	}
		
	this.recupereUm = async function (codigo)
	{
		const conexao = await this.bd.getConexao();
		
		const sql = "SELECT Codigo,Placa,TO_CHAR(DataEntrada, 'YYYY-MM-DD HH24:MI:SS') "+
		            "FROM Veiculos WHERE Codigo=:0";
		const dados = [codigo];
		ret =  await conexao.execute(sql,dados);
		
		return ret.rows;
	}
}

function Veiculo (codigo,placa,dataentrada)
{
	    this.codigo = codigo;
	    this.placa   = placa;
	    this.dataentrada  = dataentrada;
}

function Comunicado (codigo,mensagem,descricao)
{
	this.codigo    = codigo;
	this.mensagem  = mensagem;
	this.descricao = descricao;
}

function middleWareGlobal (req, res, next)
{
    console.time('Requisição'); // marca o início da requisição
    console.log('Método: '+req.method+'; URL: '+req.url); // retorna qual o método e url foi chamada

    next(); // função que chama as próximas ações

    console.log('Finalizou'); // será chamado após a requisição ser concluída

    console.timeEnd('Requisição'); // marca o fim da requisição
}

// para a rota de CREATE
async function inclusao (req, res)
{
    if (!req.body.codigo || !req.body.placa)
    {
        const erro1 = new Comunicado ('DdI','Dados incompletos',
		                  'Não foram informados todos os dados do veículo');
        return res.status(422).json(erro1);
    }
    
    const veiculo = new Veiculo (req.body.codigo,req.body.placa,req.body.dataentrada);

    try
    {
        await  global.veiculos.inclua(veiculo);
        const  sucesso = new Comunicado ('IBS','Inclusão bem sucedida',
		                  'O veículo foi incluído com sucesso');
        return res.status(201).json(sucesso);
	}
	catch (erro)
	{
		console.log('TESTE AQUI');
		const  erro2 = new Comunicado ('LJE','Veículo existente',
		                  'Já há veículo cadastrado com o código informado');
        return res.status(409).json(erro2);
    }
}

// para a primeira rota de READ (todos)
async function recuperacaoDeTodos (req, res)
{
    if (req.body.codigo || req.body.placa || req.body.data)
    {
        const erro = new Comunicado ('JSP','JSON sem propósito',
		             'Foram disponibilizados dados em um JSON sem necessidade');
        return res.status(422).json(erro);
    }
	
    let rec;
	try
	{
	    rec = await global.veiculos.recupereTodos();
	}    
    catch(erro)
    {}

	if (rec.length==0)
	{
		return res.status(200).json([]);
	}
	else
	{
		const ret=[];
		for (i=0;i<rec.length;i++) ret.push (new Veiculo (rec[i][0],rec[i][1],rec[i][2]));
		return res.status(200).json(ret);
	}
} 

// para a segunda rota de READ (um)
async function recuperacaoDeUm (req, res)
{
    if (req.body.codigo || req.body.placa || req.body.dataentrada)
    {
        const erro1 = new Comunicado ('JSP','JSON sem propósito',
		                  'Foram disponibilizados dados em um JSON sem necessidade');
        return res.status(422).json(erro1);
    }

    const codigo = req.params.codigo;
    
    let ret;
	try
	{
	    ret = await global.veiculos.recupereUm(codigo);
	}    
    catch(erro)
    {}

	if (ret.length==0)
	{
		const erro2 = new Comunicado ('LNE','Veículo inexistente',
		                  'Não há veículo cadastrado com o código informado');
		return res.status(404).json(erro2);
	}
	else
	{
		ret = ret[0];
		ret = new Veiculo (ret[0],ret[1],ret[2]);
		return res.status(200).json(ret);
	}
}

async function ativacaoDoServidor ()
{
    const bd = new BD ();
	await bd.estrutureSe();
    global.veiculos = new Veiculos (bd);

    const express = require('express');
    const app     = express();
	const cors    = require('cors')
    
    app.use(express.json());   // faz com que o express consiga processar JSON
	app.use(cors()) //habilitando cors na nossa aplicacao (adicionar essa lib como um middleware da nossa API - todas as requisições passarão antes por essa biblioteca).
    app.use(middleWareGlobal); // app.use cria o middleware global

    app.post  ('/veiculos'        , inclusao); 
    app.get   ('/veiculos'        , recuperacaoDeTodos);
    app.get   ('/veiculos/:codigo', recuperacaoDeUm);

    console.log ('Servidor ativo na porta 3000...');
    app.listen(3000);
}

ativacaoDoServidor();
