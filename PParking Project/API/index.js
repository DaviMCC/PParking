function BD ()
{
	process.env.ORA_SDTZ = 'UTC-3';
	
	this.getConexao = async function ()
	{
		if (global.conexao)
			return global.conexao;

        const oracledb = require('oracledb');
        const dbConfig = require('./dbconfig.js');
        
        try
        {
		    global.conexao = await oracledb.getConnection(dbConfig);
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
			
			const sql   = 'CREATE TABLE TICKETS(' +
				'CODIGO VARCHAR(8) PRIMARY KEY NOT NULL, PLACA VARCHAR2(7) NOT NULL,' +
				'DATA_ENTRADA VARCHAR(20) NOT NULL, DATA_SAIDA VARCHAR(20),' +
				'DATA_PAGAMENTO VARCHAR(20),' +
				'STATUS_TICKET VARCHAR(12) NOT NULL,' + 
				'VALOR_ESTADIA VARCHAR(12))'
			await conexao.execute(sql);
            console.log ('Tabelas não existiam e foram criadas com sucesso!');

		}
		catch (erro)
		{
            console.log ('Tabelas já existem, pulando etapa de criação!');
			console.log(erro);
        } 
	}
}

function geraCodigoTicket(){

	const crypto = require('crypto')

	var current_date = (new Date()).valueOf().toString();
	var random = Math.random().toString();

	return (crypto.createHash('sha1').update(current_date + random).digest('hex')).substring(0, 8).toUpperCase();
	
}

function acoesTicket (bd)
{
	this.bd = bd;
	
	this.incluaEntrada = async function (ticket)

	{
		const conexao = await this.bd.getConexao();
		
		const sql1 = "INSERT INTO TICKETS (CODIGO, PLACA, DATA_ENTRADA, STATUS_TICKET) VALUES (:0, :1, to_char(sysdate,'dd/mm/yyyy HH24:MI'),:2)"
		const dados = [ticket.codigo.toUpperCase(), ticket.placa, 'BLOQUEADO'];

		console.log(sql1, dados);
		await conexao.execute(sql1,dados);
		
		const sql2 = 'COMMIT';
		await conexao.execute(sql2);	
		
	}
		
	this.recupereTodosTickets = async function ()
	{
		const conexao = await this.bd.getConexao();
		
		const sql = "SELECT * FROM TICKETS";
		ret =  await conexao.execute(sql);

		return ret.rows;
	}

	this.recupereTodosTicketsPorStatus = async function (status)
	{
		const conexao = await this.bd.getConexao();
		
		const sql = "SELECT * FROM TICKETS WHERE STATUS_TICKET =:0";

		const dados = [status];

		ret =  await conexao.execute(sql, dados);

		return ret.rows;
	}
		
	this.recuperaUmTicket = async function (codigo)
	{
		const conexao = await this.bd.getConexao();
		
		const sql = "SELECT * FROM Tickets WHERE CODIGO=:0";
		const dados = [codigo];
		ret =  await conexao.execute(sql,dados);
		
		return ret.rows;
	}

	this.atualizaStatusDeUmTicket = async function (status, codigo)
	{
		const conexao = await this.bd.getConexao();

		const sql = "UPDATE TICKETS SET STATUS_TICKET=:0 WHERE CODIGO=:1";
		const dados = [status, codigo];
		await conexao.execute(sql,dados);

		const sql2 = 'COMMIT';
		await conexao.execute(sql2);	

	}

	this.verificaVeiculoAtivoNoEstacionamento = async function (placa)
	{
		const conexao = await this.bd.getConexao();

		const sql = "SELECT * FROM Tickets WHERE PLACA=:0 AND STATUS_TICKET != 'Finalizado'";

		const dados = [placa];

		ret =  await conexao.execute(sql,dados);
		
		if (ret.rows.length > 0){
			return true;
		}

		return false;
	}
}

function Ticket (codigo,placa, dataEntrada, dataSaida, dataPagamento, status, valorEstadia, placaVeiculo)
{
	    this.codigo = codigo;
	    this.placa   = placa;
	    this.dataEntrada  = dataEntrada;
		this.dataSaida  = dataSaida;
	    this.dataPagamento  = dataPagamento;
	    this.status  = status;
	    this.valorEstadia  = valorEstadia;
	    this.placaVeiculo  = placaVeiculo;

}

function Comunicado (codigo,mensagem,descricao)
{
	this.codigo    = codigo;
	this.mensagem  = mensagem;
	this.descricao = descricao;
}

function middleWareGlobal (req, res, next)
{
    console.time('Requisição'); 
    console.log('Método: '+req.method+'; URL: '+req.url);

    next(); 

    console.log('Finalizou');

    console.timeEnd('Requisição'); 
}


async function inclusaoEntrada (req, res)
{
    if (!req.body.placa)
    {
        const erro1 = new Comunicado ('DdI','Placa de veículo necessária',
		                  'Não foram informados os dados do veículo');
        return res.status(422).json(erro1);
    }


	let jaEstaNoEstacionamento = await global.acoesTicket.verificaVeiculoAtivoNoEstacionamento(req.body.placa);

	if(jaEstaNoEstacionamento == true){
		const erro2 = new Comunicado ('PPVE','Placa pertence a um veiculo ativo',
		'A placa informada pertence a um veiculo que se encontra dentro do estacionamento.');
		return res.status(409).json(erro2);
	}

	const codigo = geraCodigoTicket();
    
    const ticket = new Ticket (codigo, req.body.placa);

    try
    {
        await  global.acoesTicket.incluaEntrada(ticket);
		let ret = await global.acoesTicket.recuperaUmTicket(codigo);
		ret = ret[0];
		ret = new Ticket (ret[0],ret[1],ret[2]);
        return res.status(201).json(ret);
	}
	catch (error)
	{
		console.log(error);
		console.log('TESTE AQUI');
		const  erro3 = new Comunicado ('LJE','Veículo existente',
		                  'Já há veículo cadastrado com o código informado');
        return res.status(409).json(erro3);
    }
}

async function recuperacaoDeTodosTickets (req, res)
{
    if (req.body.codigo || req.body.placa || req.body.data)
    {
        const erro = new Comunicado ('JSP','JSON sem propósito',
		             'Foram disponibilizados dados em um JSON sem necessidade');
        return res.status(422).json(erro);
    }
	
	try
	{
	    let rec = await global.acoesTicket.recupereTodosTickets();

		if (rec.length==0)
		{
			return res.status(200).json([]);
		}
		else
		{
			const ret=[];
			for (i=0;i<rec.length;i++) ret.push (new Ticket (rec[i][0],rec[i][1],rec[i][2]));
			return res.status(200).json(ret);
		}
	}    
    catch(erro)
    {
		console.log(erro);
		const erro1 = new Comunicado ('EI','Erro Interno',
		                  'Não foi possível recuperar as informações');
        return res.status(500).json(erro1);
	}
} 

async function recuperacaoDeTodosPorStatus (req, res)
{
    if (req.body.length > 0)
    {
        const erro1 = new Comunicado ('JSP','JSON sem propósito',
		                  'Foram disponibilizados dados em um JSON sem necessidade');
        return res.status(422).json(erro1);
    }
	
	try
	{
	    let rec = await global.acoesTicket.recupereTodosTicketsPorStatus(req.params.status);

		if (rec.length==0)
		{
			return res.status(200).json([]);
		}
		else
		{
			const ret=[];
			for (i=0;i<rec.length;i++) ret.push (new Ticket (rec[i][0],rec[i][1],rec[i][2]));
			return res.status(200).json(ret);
		}
	}    
    catch(erro)
    {
		console.log(erro);
		const erro1 = new Comunicado ('EI','Erro Interno',
		                  'Não foi possível recuperar as informações');
        return res.status(500).json(erro1);
	}
} 

async function recuperaTicketPorCodigo (req, res)
{
    if (req.body.length > 0)
    {
        const erro1 = new Comunicado ('JSP','JSON sem propósito',
		                  'Foram disponibilizados dados em um JSON sem necessidade');
        return res.status(422).json(erro1);
    }

    const codigo = req.params.codigo;
    
	try
	{
	   let ret = await global.acoesTicket.recuperaUmTicket(codigo);

		if (ret.length==0)
	{
		const erro2 = new Comunicado ('LNE','Ticket inexistente',
		                  'Não existe nenhum ticket com o código informado');
		return res.status(404).json(erro2);
	}
	else
	{
		ret = ret[0];
		ret = new Ticket (ret[0],ret[1],ret[2]);
		return res.status(200).json(ret);
	}

	}    
    catch(erro)
    {
		const erro3 = new Comunicado ('EI','Erro Interno',
		                  'Não foi possível recuperar as informações');
        return res.status(500).json(erro3);
	}

}

async function atualizaStatusTicket (req, res)
{
    if (!req.body.status)
    {
        const erro1 = new Comunicado ('DNI','Dados não informados',
		                  'Não foram informados os dados a serem atualizados');
        return res.status(422).json(erro1);
    }
    
    try
    {
        await  global.acoesTicket.atualizaStatusDeUmTicket(req.body.status, req.params.codigo)
        const  sucesso = new Comunicado ('AE','Atualização efetuada',
		                  'O status do ticket foi atualizado com sucesso');
        return res.status(201).json(sucesso);
	}
	catch (error)
	{
		console.log(error);
		console.log('TESTE AQUI');
		const  erro3 = new Comunicado ('LJE','Veículo existente',
		                  'Já há veículo cadastrado com o código informado');
        return res.status(409).json(erro3);
    }
}

async function ping(req, res){

	return res.status(200).json();
}

async function ativacaoDoServidor ()
{
    const bd = new BD ();
	await bd.estrutureSe();
    global.acoesTicket = new acoesTicket (bd);


    const express = require('express');
    const app     = express();
	const cors    = require('cors')
    
    app.use(express.json());   
	app.use(cors()) 
    app.use(middleWareGlobal); 

    app.post  ('/entrada', inclusaoEntrada);  
    app.get   ('/tickets', recuperacaoDeTodosTickets);
	app.get   ('/tickets/status/:status', recuperacaoDeTodosPorStatus);
    app.get   ('/tickets/codigo/:codigo', recuperaTicketPorCodigo);
	app.patch ('/tickets/status/:codigo', atualizaStatusTicket);
	app.get   ('/ping', ping);

    console.log ('Servidor ativo na porta 3000...');
    app.listen(3000);
}

ativacaoDoServidor();
