function exibirMensagem(titulo, mensagem) {

    const p1 = document.querySelector('.digitacao-e-verificacao');
    p1.style.display = "none";

    document.getElementById("mensagem-inicial").innerHTML = titulo;

    document.getElementById("mensagem-instrucao").innerHTML = mensagem;

    const instrucao = document.querySelector('#mensagem-instrucao');
    instrucao.style.paddingTop = '160px';
    instrucao.style.fontSize = '45px';

    retornarHome();
}
function retornarHome() {

    setTimeout((() => { window.location.replace("cabine_saida.html") }), 10000);

}

function Ticket(status, horaEntrada) {
    this.status = status;
    this.horaEntrada = horaEntrada;
}

function verificarTicket() {

    let ticket = document.getElementById('campo-insercao-dados').value

    if (ticket !== "") {
        let url = `http://localhost:3000/tickets/codigo/${ticket}`

        let res = axios.get(url).then(response => {
            if (response.data) {

                let horaEntrada = response.data.dataEntrada.slice(response.data.dataEntrada.length - 5);
                const ticketEncontrado = new Ticket(response.data.status, horaEntrada)

                if (ticketEncontrado.status == "DESBLOQUEADO") {
                    finalizarTicket(ticket);
                    exibirMensagem("Agradeçemos pela estadia!", "Sua saída foi validada e a cancela está liberada!");
                }
                else if (ticketEncontrado.status == "BLOQUEADO") {

                    var estadiaEmSegundos = calculaDiferencaHorario(ticketEncontrado.horaEntrada);

                    if (estadiaEmSegundos > 900) {
                        exibirMensagem("A sua saída não foi validada...", "Sua estádia ultrapassou o periodo gratuito. <p> Retorne ao caixa de auto-atendimento para "
                            + "efetuar seu pagamento.");
                    } else if (estadiaEmSegundos <= 900) {
                        finalizarTicket(ticket);
                        exibirMensagem("Agradeçemos pela sua estadia!", "Periodo gratuito de 15 minutos não ultrapassado. <p>Cancela liberada!</p>");
                    }
                }
                else if (ticketEncontrado.status == "FINALIZADO") {
                    exibirMensagem("Ops! Algo deu errado!", "Ticket inválido.");
                }
            }
        })
            .catch(error => {

                if (error.response) {

                    exibirMensagem("Ops! Algo deu errado!", error.response.data.descricao);
                    console.log(error);

                }
            })
    }
    retornarHome();
}

function calculaDiferencaHorario(hhmmEntrada) {

    var hhmmAtual = recuperaHHMMatual();

    var inicial = hhmmEntrada, final = hhmmAtual;

    var splInicial = inicial.split(":"), splFinal = final.split(":");

    var inicialMin = (Number(splInicial[0] * 60)) + Number(splInicial[1]);
    var finalMin = (Number(splFinal[0] * 60)) + Number(splFinal[1]);

    var totalMin = Number(finalMin - inicialMin);
    var tot = Math.trunc(totalMin / 60).toString() + ":" + (totalMin % 60).toString();

    var totSplit = tot.split(":");
    var diferencaEmSeg = (Number(totSplit[0] * 3600) + Number(totSplit[1]) * 60);


    return diferencaEmSeg;

}

function finalizarTicket(codigo) {
    let url = `http://localhost:3000/tickets/saida/${codigo}`

    let res = axios.patch(url).then(response => {
        if (response.data) { }
    })
        .catch(error => {
            if (error.response) {
                exibirMensagem("Ops! Algo deu errado!", "Houve um erro interno, por favor tentar novamente");
            }
        })
}

function recuperaHHMMatual() {
    var data = new Date();
    var horaAtual = data.getHours().toString();
    var minutosAtuais = data.getMinutes().toString();
    var horaEminutos = horaAtual + ":" + minutosAtuais;

    return horaEminutos;
}
