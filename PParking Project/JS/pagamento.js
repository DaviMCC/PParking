var ticket;

function exibirTicket(ticket) {
    const instrucao = document.getElementsByClassName("instrucao")[0].innerHTML = "Verifique as informações";

    const caixa1 = document.querySelector(".caixa1");
    caixa1.style.height = "890px";

    const p1 = document.querySelector('.p1 form');
    p1.style.display = "none";

    const p2 = document.querySelector('.p2');
    p2.style.display = "inline-block";

    let numeroTicket = document.getElementById("numeroTicket").innerHTML = "Ticket: " + ticket.codigo;
    let placa = document.getElementById("placa").innerHTML = ticket.placa;

    if (ticket.permanencia.horas > 1) {
        permanencia = ticket.permanencia.horas + " horas e " ;
    } else {
        permanencia = ticket.permanencia.horas + " hora e ";
    }

    if(ticket.permanencia.minutos > 1){
        permanencia += ticket.permanencia.minutos + " minutos";
    }else{
        permanencia += ticket.permanencia.minutos + " minuto";
    }

    if (ticket.permanencia.pernoite > 0) {
        permanencia = ticket.permanencia.pernoite + " pernoite " + permanencia;
    }

    let permancia = document.getElementById("permancia").innerHTML = permanencia;

    let dataEntrada = document.getElementById("dataEntrada").innerHTML = ticket.dataEntrada;
    let dataAtual = document.getElementById("dataAtual").innerHTML = ticket.dataSaida;
    let total = document.getElementById("total").innerHTML = "R$" + ticket.total + ".00";

    return false;
}

function prosseguir() {
    document.getElementsByClassName("instrucao")[0].innerHTML = "Selecione o metodo de pagamento";

    let p2 = document.querySelector('.p2');
    p2.style.display = "none";

    let p3 = document.querySelector('.p3');
    p3.style.display = "inline-block";

    let caixa1 = document.querySelector(".caixa1");
    caixa1.style.height = "750px";
}

function exibirPagamento() {
    let p3 = document.querySelector('.p3');
    p3.style.display = "none";

    document.getElementsByClassName("titulo")[0].innerHTML = "Somos gratos pelo seu pagamento!";

    document.getElementsByClassName("instrucao")[0].innerHTML = "Seu pagamento foi processado com sucesso e seu ticket está validado.";

    let p2 = document.querySelector('.p4');
    p2.style.display = "inline-block";

    let numeroTicket = document.getElementById("numero-ticket").innerHTML = "Ticket: " + ticket.codigo;
    let placa = document.getElementById("placa-veiculo").innerHTML = ticket.placa;
    let horaPagamento = document.getElementById("hora-pagamento").innerHTML = ticket.dataSaida;
    let total = document.getElementById("total-pag").innerHTML =  "R$" + ticket.total + ",00";

    retornarHome();
}

function alertarErro(mensagem, fase, titulo) {

    if (fase == "checkout") {

        const p1 = document.querySelector('.p1 form');
        p1.style.display = "none";

    } else if (fase == "prosseguir") {

        const p2 = document.querySelector('.p2');
        p2.style.display = "none";
    } else if (fase == "pagamento") {

        const p3 = document.querySelector('.p3');
        p3.style.display = "none";
    }

    document.getElementsByClassName("titulo")[0].innerHTML = titulo;

    document.getElementsByClassName("instrucao")[0].innerHTML = mensagem;

    const instrucao = document.querySelector('.instrucao');
    instrucao.style.paddingTop = '160px';
    instrucao.style.fontSize = '45px';

    retornarHome();
}

function sair(){
    window.location.replace("cabine_pagamentos.html");
}

function retornarHome() {

    setTimeout((() => { window.location.replace("cabine_pagamentos.html") }), 10000);

}

function fazerPagamento(){
    if (ticket.codigo !== "") {

        let url = `http://localhost:3000/tickets/pagamento/${ticket.codigo}`
        let body = {pagamento:ticket.total}

        let res = axios.patch(url, body).then(response => {
            if (response.data) {
                exibirPagamento();            }
        })
            .catch(error => {
                
                    alertarErro("Erro interno, por favor tente novamente.", "checkout", "Ops! Algo deu errado!");
            })
    }
}

function fazerCheckout() {

    let codigo = document.getElementById('campo-insercao').value

    if (codigo !== "") {
        let url = `http://localhost:3000/tickets/checkout/${codigo}`

        let res = axios.get(url).then(response => {
            if (response.data) {

                    ticket = response.data;
                    exibirTicket(ticket);
            }
        })
            .catch(error => {
                if (error.response.data.codigo == "TPF") {
                    alertarErro("Por favor, insira um ticket que ainda não foi pago ou finalizado", "checkout", "Ticket inválido");
                } 
                else if(error.response.data.codigo == "EG"){
                    alertarErro("Periodo gratuito de quinze minutos não ultrapassado.", "checkout", "Periodo de estadia gratuito");
                }
                else if(error.response.data.codigo == "LNE"){
                    alertarErro("Insira um ticket válido, por favor.", "checkout", "Ticket invalido");
                }
                else{
                    alertarErro("Erro interno, por favor tente novamente.", "checkout", "Ops! Algo deu errado!");
                }
            })
    }
}







