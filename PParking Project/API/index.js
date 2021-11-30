const moment = require('moment');

function BD() {
	process.env.ORA_SDTZ = 'UTC-3';

	this.getConexao = async function () {
		if (global.conexao)
			return global.conexao;

		const oracledb = require('oracledb');
		oracledb.autoCommit = true;
		const dbConfig = require('./dbconfig.js');

		try {
			global.conexao = await oracledb.getConnection(dbConfig);
		}
		catch (erro) {
			console.log('Não foi possível estabelecer conexão com o BD!');
			console.log(erro);
			process.exit(1);
		}

		return global.conexao;
	}

	this.estrutureSe = async function () {
		try {
			const conexao = await this.getConexao();

			const sql = 'CREATE TABLE TICKETS(' +
				'CODIGO VARCHAR(8) PRIMARY KEY NOT NULL, PLACA VARCHAR2(7) NOT NULL,' +
				'DATA_ENTRADA VARCHAR(20) NOT NULL, DATA_SAIDA VARCHAR(20),' +
				'DATA_PAGAMENTO VARCHAR(20),' +
				'STATUS_TICKET VARCHAR(12) NOT NULL,' +
				'VALOR_ESTADIA NUMBER(12))'
			await conexao.execute(sql);
			console.log('Tabelas não existiam e foram criadas com sucesso!');

		}
		catch (erro) {
			console.log('Tabelas já existem, pulando etapa de criação!');
			console.log(erro);
		}
	}
}

function geraCodigoTicket() {

	const crypto = require('crypto')

	var current_date = (new Date()).valueOf().toString();
	var random = Math.random().toString();

	return (crypto.createHash('sha1').update(current_date + random).digest('hex')).substring(0, 8).toUpperCase();

}

function acoesTicket(bd) {
	this.bd = bd;

	this.incluaEntrada = async function (ticket) {
		const conexao = await this.bd.getConexao();

		const sql1 = "INSERT INTO TICKETS (CODIGO, PLACA, DATA_ENTRADA, STATUS_TICKET) VALUES (:0, :1, to_char(sysdate,'dd/mm/yyyy HH24:MI'),:2)"
		const dados = [ticket.codigo.toUpperCase(), ticket.placa, 'BLOQUEADO'];

		console.log(sql1, dados);
		await conexao.execute(sql1, dados);

		const sql2 = 'COMMIT';
		await conexao.execute(sql2);

	}


	this.recupereTodosTicketsPorStatus = async function (status) {
		const conexao = await this.bd.getConexao();

		let sql;

		sql = "select * from tickets where status_ticket =:0";
		
		const dados = [status.toUpperCase()];

		ret = await conexao.execute(sql, dados);

		return ret.rows;
	}

	this.recuperarFaturamento = async function (dia) {
		const conexao = await this.bd.getConexao();

		let sql;

		sql = "SELECT sum (valor_estadia), count(*) FROM TICKETS where data_pagamento LIKE '%" + dia + "%'";
		
		ret = await conexao.execute(sql);

		return ret.rows;
	}

	this.recuperaUmTicket = async function (codigo) {
		const conexao = await this.bd.getConexao();

		const sql = "SELECT * FROM Tickets WHERE CODIGO=:0";
		const dados = [codigo];
		ret = await conexao.execute(sql, dados);

		return ret.rows;
	}

	this.atualizaStatusDeUmTicket = async function (status, codigo) {
		const conexao = await this.bd.getConexao();

		const sql = "UPDATE TICKETS SET STATUS_TICKET=:0 WHERE CODIGO=:1";
		const dados = [status, codigo];
		await conexao.execute(sql, dados);

		const sql2 = 'COMMIT';
		await conexao.execute(sql2);

	}

	this.finalizaUmTicket = async function (codigo) {
		const conexao = await this.bd.getConexao();

		const sql = "UPDATE TICKETS SET STATUS_TICKET=:0, DATA_SAIDA=to_char(sysdate,'dd/mm/yyyy hh24:mi')  WHERE CODIGO=:1";
		const dados = ['FINALIZADO', codigo];
		await conexao.execute(sql, dados);

		const sql2 = 'COMMIT';
		await conexao.execute(sql2);

	}

	this.executaPagamento = async function (codigo, pagamento) {
		const conexao = await this.bd.getConexao();

		const sql = "UPDATE TICKETS SET STATUS_TICKET=:0, DATA_PAGAMENTO=to_char(sysdate,'dd/mm/yyyy hh24:mi'), VALOR_ESTADIA=:1  WHERE CODIGO=:2";
		const dados = ['DESBLOQUEADO', pagamento, codigo];
		await conexao.execute(sql, dados);

		const sql2 = 'COMMIT';
		await conexao.execute(sql2);

	}

	this.verificaVeiculoAtivoNoEstacionamento = async function (placa) {
		const conexao = await this.bd.getConexao();

		const sql = "SELECT * FROM Tickets WHERE PLACA=:0 AND STATUS_TICKET != 'FINALIZADO'";

		const dados = [placa];

		ret = await conexao.execute(sql, dados);

		if (ret.rows.length > 0) {
			return true;
		}

		return false;
	}
}

function Ticket(codigo, placa, dataEntrada, dataSaida, dataPagamento, status, valorEstadia, placaVeiculo) {
	this.codigo = codigo;
	this.placa = placa;
	this.dataEntrada = dataEntrada;
	this.dataSaida = dataSaida;
	this.dataPagamento = dataPagamento;
	this.status = status;
	this.valorEstadia = valorEstadia;
	this.placaVeiculo = placaVeiculo;

}

function Comunicado(codigo, mensagem) {
	this.codigo = codigo;
	this.mensagem = mensagem;
}

function middleWareGlobal(req, res, next) {
	console.time('Requisição');
	console.log('Método: ' + req.method + '; URL: ' + req.url);

	next();

	console.log('Finalizou');

	console.timeEnd('Requisição');
}


async function inclusaoEntrada(req, res) {
	if (!req.body.placa) {
		const erro1 = new Comunicado('DF', 'Dados faltando');
		return res.status(400).json(erro1);
	}

	let jaEstaNoEstacionamento = await global.acoesTicket.verificaVeiculoAtivoNoEstacionamento(req.body.placa);

	if (jaEstaNoEstacionamento == true) {
		const erro2 = new Comunicado('PPVE', 'Placa pertence a um veiculo ativo');
		return res.status(409).json(erro2);
	}

	const codigo = geraCodigoTicket();

	const ticket = new Ticket(codigo, req.body.placa);

	try {
		await global.acoesTicket.incluaEntrada(ticket);
		let ret = await global.acoesTicket.recuperaUmTicket(codigo);
		ret = ret[0];
		ret = new Ticket(ret[0], ret[1], ret[2]);
		return res.status(201).json(ret);
	}
	catch (error) {
		console.log(erro);
		const erro1 = new Comunicado('EI', 'Erro Interno');
		return res.status(500).json(erro1);
	}
}

async function recuperacaoDeTodosPorStatus(req, res) {
	if (req.body.length > 0) {
		const erro1 = new Comunicado('JSP', 'JSON sem propósito');
		return res.status(422).json(erro1);
	}

	if(req.params.status != "desbloqueado" && req.params.status != "bloqueado" && req.params.status != "finalizado"){
		const erro2 = new Comunicado('SI', 'Status inválido');
		return res.status(400).json(erro2);
	}

	try {
		let rec = await global.acoesTicket.recupereTodosTicketsPorStatus(req.params.status);

		if (rec.length == 0) {
			return res.status(200).json([]);
		}
		else {
			const ret = [];
			for (i = 0; i < rec.length; i++) ret.push(new Ticket(rec[i][0], rec[i][1], rec[i][2], rec[i][3], rec[i][4], rec[i][5], rec[i][6], rec[i][7]));
			return res.status(200).json(ret);
		}
	}
	catch (erro) {
		console.log(erro);
		const erro1 = new Comunicado('EI', 'Erro Interno');
		return res.status(500).json(erro1);
	}
}

async function executarFaturamento(req, res) {
	if (req.body.length > 0) {
		const erro1 = new Comunicado('DF', 'Dados faltando');
		return res.status(422).json(erro1);
	}

	try {
		let rec = await global.acoesTicket.recuperarFaturamento(req.body.data);
		let a = req.body.data;
		if (rec.length == 0) {
			return res.status(200).json([]);
		}
		else {
			const ret = [];
			faturamento = {faturamentoTotal:rec[0][0], ticketsPagos:rec[0][1]}
			return res.status(200).json(faturamento);
		}
	}
	catch (erro) {
		console.log(erro);
		const erro1 = new Comunicado('EI', 'Erro Interno');
		return res.status(500).json(erro1);
	}
}

async function checkout(req, res) {
	if (req.body.length > 0) {
		const erro1 = new Comunicado('JSP', 'JSON sem propósito')
		return res.status(422).json(erro1);
	}

	const codigo = req.params.codigo;

	try {
		let ret = await global.acoesTicket.recuperaUmTicket(codigo);

		if (ret.length == 0) {
			const erro2 = new Comunicado('LNE', 'Ticket inexistente');
			return res.status(404).json(erro2);
		}
		else {
			ret = ret[0];
			ret = new Ticket(ret[0], ret[1], ret[2], ret[3], ret[4], ret[5], ret[6]);
			var sucesso = executarCheckout(ret);
			if (sucesso.codigo == "TPF" || sucesso.codigo == "EG") {
				return res.status(400).json(sucesso);
			} else if (sucesso.placa) {
				return res.status(200).json(sucesso);
			}
		}

	}
	catch (erro) {
		const erro3 = new Comunicado('EI', 'Erro Interno');
		return res.status(500).json(erro3);
	}

}

async function efetuaSaida(req, res) {
	if (req.body.length > 0) {
		const erro1 = new Comunicado('JSP', 'JSON sem propósito');
		return res.status(422).json(erro1);
	}

	try {

		let ticket =  await global.acoesTicket.recuperaUmTicket(req.params.codigo);
		if(ticket.length == 0){
		const comunicado = new Comunicado("TNE", "Ticket não encontrado");
		return res.status(400).json(comunicado);
		}

		ticket = ticket[0];
		ticket = new Ticket(ticket[0], ticket[1], ticket[2], ticket[3], ticket[4], ticket[5], ticket[6], ticket[7]);

		const sucesso = executaSaida(ticket);
		if (sucesso.codigo == "SVS" || sucesso.codigo == "SVSEG") {
			await global.acoesTicket.finalizaUmTicket(ticket.codigo);
			return res.status(201).json(sucesso);
		}else{
			return res.status(400).json(sucesso);
		}
	}
	catch (error) {
		console.log(error);
		const erro3 = new Comunicado('EI', 'Erro Interno');
		return res.status(500).json(erro3);
	}
}

async function pagaTicket(req, res) {
	if (!req.body.pagamento) {
		const erro1 = new Comunicado('IF', 'Informações faltando na requisição');
		return res.status(400).json(erro1);
	}

	try {
		await global.acoesTicket.executaPagamento(req.params.codigo, req.body.pagamento)
		const sucesso = new Comunicado('PES', 'Pagamento efetuado com sucesso');
		return res.status(200).json(sucesso);
	}
	catch (error) {
		console.log(error);
		const erro3 = new Comunicado('EI', 'Erro Interno',);
		return res.status(500).json(erro3);
	}
}

function executaSaida(ticket) {

	if (ticket.status == "DESBLOQUEADO") {
		const comunicado = new Comunicado("SVS", "Saída validada com sucesso");
		return comunicado;
	}
	else if (ticket.status == "BLOQUEADO") {

		var horasDePermanenciaEmSegundos = calculaDiferencaEntreHoras(ticket.dataEntrada.slice(ticket.dataEntrada.length - 5));
		var diasDePermanencia = calculaDiferencaEntreDias(ticket.dataEntrada);

		if (horasDePermanenciaEmSegundos <= 900 && diasDePermanencia == 0) {
			const comunicado = new Comunicado("SVSEG", "Saída validada com sucesso, estadia gratuita.");
			return comunicado;
		} else if (horasDePermanenciaEmSegundos > 900 || diasDePermanencia > 0) {
			const comunicado = new Comunicado("SNV", "Saída não validada, pagamento pendente.");
			return comunicado;
		}
	}
	else if (ticket.status == "FINALIZADO") {
		const comunicado = new Comunicado("TJF", "Ticket já finalizado.");
		return comunicado;
	}

}

function executarCheckout(ticket) {

	if (ticket.status == "FINALIZADO" || ticket.status == "DESBLOQUEADO") {
		const erro1 = new Comunicado('TPF', 'Ticket Pago ou Finalizado');
		return (erro1);
	}
	var horasDePermanenciaEmSegundos = calculaDiferencaEntreHoras(ticket.dataEntrada.slice(ticket.dataEntrada.length - 5));
	var diasDePermanencia = calculaDiferencaEntreDias(ticket.dataEntrada);

	if (horasDePermanenciaEmSegundos <= 900 && diasDePermanencia == 0) {
		const erro2 = new Comunicado('EG', 'Estadia gratuita');
		return (erro2);
	} else {

		var valorEstadia = calculaEstadia(horasDePermanenciaEmSegundos, ticket.dataEntrada);
		var dataDeSaida = moment().format("DD/MM/YYYY HH:mm");
		var permanenciaTotal = calculaPermanenciaTotal(horasDePermanenciaEmSegundos, diasDePermanencia);

		ticket = { codigo: ticket.codigo, placa: ticket.placa, dataEntrada: ticket.dataEntrada, dataSaida: dataDeSaida, permanencia: permanenciaTotal, total: valorEstadia };

		return ticket;
	}

}

function calculaDiferencaEntreHoras(hhmmEntrada) {

	var hhmmAtual = moment().format("DD/MM/YYYY HH:mm").substring(11, 16);

	var inicial = hhmmEntrada, final = hhmmAtual;

	var splInicial = inicial.split(":"), splFinal = final.split(":");

	var inicialMin = (Number(splInicial[0] * 60)) + Number(splInicial[1]);
	var finalMin = (Number(splFinal[0] * 60)) + Number(splFinal[1]);

	var totalMin = Math.abs(Number(finalMin - inicialMin));
	var tot = Math.trunc(totalMin / 60).toString() + ":" + (totalMin % 60).toString();

	var totSplit = tot.split(":");
	var diferencaEmSeg = (Number(totSplit[0] * 3600) + Number(totSplit[1]) * 60);

	return diferencaEmSeg;
}

function calculaDiferencaEntreDias(dataEntrada) {

	var d1 = dataEntrada.substring(0, 10);
	var d2 = moment().format("DD/MM/YYYY");
	var diff = moment(d2, "DD/MM/YYYY").diff(moment(d1, "DD/MM/YYYY"));
	return moment.duration(diff).asDays();
}

function calculaPermanenciaTotal(diferencaEntreHoras, diasDePermanencia) {
	segundos = diferencaEntreHoras;

	var minutos = Math.floor(segundos / 60);
	segs = segundos % 60;
	var horas = Math.floor(minutos / 60)
	minutos = minutos % 60;

	if (minutos == 0) {
		minutos + "0";
	}

	return { pernoite: diasDePermanencia, horas: horas, minutos: minutos }
}

function calculaEstadia(tempoPermanenciaEmSeg, dataEntrada) {

	var totAPagar = Math.floor(calculaDiferencaEntreDias(dataEntrada)) * 40;

	if (tempoPermanenciaEmSeg <= 900) {
		totAPagar += 0;
	} else if (tempoPermanenciaEmSeg <= 10800) {
		totAPagar += 12;
	} else if (tempoPermanenciaEmSeg > 10800) {
		totAPagar += 12;
		while (tempoPermanenciaEmSeg > 10800) {
			totAPagar += 1;
			tempoPermanenciaEmSeg -= 3600;
		}
	}

	return totAPagar;
}

async function ativacaoDoServidor() {
	const bd = new BD();
	await bd.estrutureSe();
	global.acoesTicket = new acoesTicket(bd);


	const express = require('express');
	const app = express();
	const cors = require('cors')

	app.use(express.json());
	app.use(cors())
	app.use(middleWareGlobal);

	app.post('/entrada', inclusaoEntrada); 
	app.get('/tickets/status/:status', recuperacaoDeTodosPorStatus); 
	app.get('/tickets/checkout/:codigo', checkout); 
	app.post('/faturamento', executarFaturamento); 
	app.get('/tickets/saida/:codigo', efetuaSaida);
	app.patch('/tickets/pagamento/:codigo', pagaTicket);

	console.log('Servidor ativo na porta 3000...');
	app.listen(3000);
}

ativacaoDoServidor();
