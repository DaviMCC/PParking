document.addEventListener('DOMContentLoaded', function() {
    preencheDados();
    carregaTabela();
}, false);

function carregaTabela(){
    var intervalId = window.setInterval(function(){
        retornarHome()
          }, 5000);
}

function retornarHome(){
    window.location.replace("simulacao.html")
}

function preencheDados(){

    geraDados("desbloqueado", "tbody1");
    geraDados("bloqueado", "tbody2");
    geraDados("finalizado", "tbody3");

}

function geraDados(status, body)
{
    let url = `http://localhost:3000/tickets/status/${status}`

        let res = axios.get(url).then(response => {
            if (response.data) {

                var new_tbody = document.createElement('tbody')

                for(i = 0; i < response.data.length; i++) {

                var linha = document.createElement("tr");
                var campo_codigo = document.createElement("td");
                var texto_codigo = document.createTextNode(response.data[i].codigo);
                campo_codigo.appendChild(texto_codigo);
                linha.appendChild(campo_codigo);

                new_tbody.appendChild(linha);

                }
                const corpo_tabela = document.getElementById(body);
                corpo_tabela.parentNode.replaceChild(new_tbody, corpo_tabela);
            }})
            .catch(error => {})     
}


