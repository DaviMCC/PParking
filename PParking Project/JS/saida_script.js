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

function executarSaida() {

    let ticket = document.getElementById('campo-insercao-dados').value.toUpperCase();

    if (ticket !== "") {
        let url = `http://localhost:3000/tickets/saida/${ticket}`

        let res = axios.get(url).then(response => {
            if (response.data) {

                if (response.data.codigo == "SVSEG") {
                    exibirMensagem("Agradeçemos pela sua estadia!", "Periodo gratuito de 15 minutos não ultrapassado. <p>Cancela liberada!</p>");
                } else if (response.data.codigo == "SVS")
                    exibirMensagem("Agradeçemos pela estadia!", "Sua saída foi validada e a cancela está liberada!");
            }
        })
            .catch(error => {

                if (error.response.data.codigo == "TNE") {

                    exibirMensagem("Ops! Algo deu errado!", "Por favor, insira um ticket válido.");
                    console.log(error);

                } else if (error.response.data.codigo == "EI") {
                    exibirMensagem("Ops! Algo deu errado!", "Erro interno, tente novamente.");
                } else if (error.response.data.codigo == "TJF") {
                    exibirMensagem("Ops! Algo deu errado!", "Por favor, insira um ticket que ainda não foi finalizado.");
                } else if (error.response.data.codigo == "SNV") {
                    exibirMensagem("Ops! Algo deu errado!", "Por favor, retorne ao caixa de pagamento para efetuar o pagamento do seu ticket.");

                }
            })
    }
    retornarHome();
}




