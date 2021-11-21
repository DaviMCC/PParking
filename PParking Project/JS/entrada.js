function exibirTicket(ticket, placa, dataEntrada) {
    const insercaoDeDados = document.querySelector(".div-insercao-dados")
    insercaoDeDados.style.display = "none"

    const mensagemInicial = document.getElementById("mensagem-inicial").innerHTML = "Aproveite a estadia!";

    const mensagemInstrucao = document.getElementById("mensagem-instrucao").innerHTML = "Retire o seu ticket";

    const informacoes = document.querySelector(".p1")
    informacoes.style.display = "inline-block";

    const numTicket = document.getElementById("mensagem-ticket").innerHTML = ticket;
    const placaVeiculo = document.getElementById("placa-veiculo").innerHTML = placa;
    const data = document.getElementById("data-entrada").innerHTML = dataEntrada;


    retornarHome();

}

function alertarErro(mensagem) {

    const insercaoDeDados = document.querySelector(".div-insercao-dados")
    insercaoDeDados.style.display = "none"

    document.getElementById("mensagem-inicial").innerHTML = "Ops! Algo deu errado!";

    document.getElementById("mensagem-instrucao").innerHTML = mensagem;

    const instrucao = document.querySelector('#mensagem-instrucao');
    instrucao.style.paddingTop = '160px';
    instrucao.style.fontSize = '45px';

    retornarHome();

}

function retornarHome() {

    setTimeout((() => { window.location.replace("cabine_entrada.html") }), 10000);

    return false;
}



function gerarTicket() {
    let placa = document.getElementById('campo-insercao-dados').value.toUpperCase();

    if (placa !== "") {
        let url = `http://localhost:3000/entrada`
        let body = { placa: placa };

        let res = axios.post(url, body)
            .then(response => {
                if (response.data) {
                    this.exibirTicket(response.data.codigo, response.data.placa, response.data.dataEntrada)
                }
            })
            .catch(error => {

                if (error.response.data.codigo == "PPVE") {

                    alertarErro("A placa inserida já pertence a um veículo estacionado.");

                }
                else {
                    alertarErro("Erro interno , por favor tente novamente.");
                }
            })
    }
}