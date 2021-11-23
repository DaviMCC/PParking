function getBloqueados()
{
    document.getElementById("titulo-busca").innerHTML = "Bloqueados";
    
    let url = `http://localhost:3000/tickets/status/bloqueado`

        let res = axios.get(url).then(response => {
            if (response.data) {
                
                document.getElementById("mensagem").style.display = "none";

                criaHeadTabela();

                var new_tbody = document.createElement('tbody');

                for(i = 0; i < response.data.length; i++) {

                var linha = document.createElement("tr");
                var campo_codigo = document.createElement("td");
                var campo_placa = document.createElement("td");
                var campo_data_entrada = document.createElement("td");

                var texto_codigo = document.createTextNode(response.data[i].codigo);
                var texto_placa = document.createTextNode(response.data[i].placa);
                var texto_data_entrada = document.createTextNode(response.data[i].dataEntrada);

                campo_codigo.appendChild(texto_codigo);
                campo_placa.appendChild(texto_placa);
                campo_data_entrada.appendChild(texto_data_entrada);

                linha.appendChild(campo_codigo);
                linha.appendChild(campo_placa);
                linha.appendChild(campo_data_entrada);

                new_tbody.appendChild(linha);
                }
                
                const corpo_tabela = document.querySelector("tbody");
                corpo_tabela.parentNode.replaceChild(new_tbody, corpo_tabela);

                }
        })
            .catch(error => {
                
                document.getElementById("mensagem").style.display = "inline";
                document.getElementById("mensagem").innerHTML = "Houve um erro, tente novamente.";
                document.getElementById("tabela").style.display = "none";

            })
}

function getDesbloqueados()
{
    document.getElementById("titulo-busca").innerHTML = "Desbloqueados";
    
    let url = `http://localhost:3000/tickets/status/desbloqueado`

        let res = axios.get(url).then(response => {
            if (response.data) {
    
                document.getElementById("mensagem").style.display = "none";

                criaHeadTabela("desbloqueado");

                var new_tbody = document.createElement('tbody');

                for(i = 0; i < response.data.length; i++) {

                var linha = document.createElement("tr");
                var campo_codigo = document.createElement("td");
                var campo_placa = document.createElement("td");
                var campo_data_entrada = document.createElement("td");
                var campo_data_pagamento = document.createElement("td");
                var campo_valor_estadia = document.createElement("td");

            
                campo_codigo.appendChild(document.createTextNode(response.data[i].codigo));
                campo_placa.appendChild(document.createTextNode(response.data[i].placa));
                campo_data_entrada.appendChild(document.createTextNode(response.data[i].dataEntrada));
                campo_data_pagamento.appendChild(document.createTextNode(response.data[i].dataPagamento));
                campo_valor_estadia.appendChild(document.createTextNode("R$"+response.data[i].valorEstadia));

                linha.appendChild(campo_codigo);
                linha.appendChild(campo_placa);
                linha.appendChild(campo_data_entrada);
                linha.appendChild(campo_data_pagamento);
                linha.appendChild(campo_valor_estadia);


                new_tbody.appendChild(linha);
                }
                
                const corpo_tabela = document.querySelector("tbody");
                corpo_tabela.parentNode.replaceChild(new_tbody, corpo_tabela);

                }
        })
            .catch(error => {
                
                document.getElementById("mensagem").style.display = "inline";
                document.getElementById("mensagem").innerHTML = "Houve um erro, tente novamente.";
                document.getElementById("tabela").style.display = "none";

            })

}

function getEncerrados()
{
   
    document.getElementById("titulo-busca").innerHTML = "Encerrados";
    
    let url = `http://localhost:3000/tickets/status/finalizado`

        let res = axios.get(url).then(response => {
            if (response.data) {

    
                document.getElementById("mensagem").style.display = "none";

                criaHeadTabela("finalizado");

                var new_tbody = document.createElement('tbody');

                for(i = 0; i < response.data.length; i++) {

                var linha = document.createElement("tr");
                var campo_codigo = document.createElement("td");
                var campo_placa = document.createElement("td");
                var campo_data_entrada = document.createElement("td");
                var campo_data_pagamento = document.createElement("td");
                var campo_valor_estadia = document.createElement("td");
                var campo_data_saida = document.createElement("td");

            
                campo_codigo.appendChild(document.createTextNode(response.data[i].codigo));
                campo_placa.appendChild(document.createTextNode(response.data[i].placa));
                campo_data_entrada.appendChild(document.createTextNode(response.data[i].dataEntrada));
                campo_data_pagamento.appendChild(document.createTextNode(response.data[i].dataPagamento));
                campo_valor_estadia.appendChild(document.createTextNode("R$"+response.data[i].valorEstadia));
                campo_data_saida.appendChild(document.createTextNode(response.data[i].dataSaida));


                linha.appendChild(campo_codigo);
                linha.appendChild(campo_placa);
                linha.appendChild(campo_data_entrada);
                linha.appendChild(campo_data_pagamento);
                linha.appendChild(campo_valor_estadia);
                linha.appendChild(campo_data_saida);

                new_tbody.appendChild(linha);
                }
                
                const corpo_tabela = document.querySelector("tbody");
                corpo_tabela.parentNode.replaceChild(new_tbody, corpo_tabela);

                }
        })
            .catch(error => {
                
                document.getElementById("mensagem").style.display = "inline";
                document.getElementById("mensagem").innerHTML = "Houve um erro, tente novamente.";
                document.getElementById("tabela").style.display = "none";

            })

}

function getFaturamento()
{

    var data = prompt("Entre com a data do dia desejado no formato abaixo", "DD-MM-AAAA");
    if(data.length < 10){

                document.getElementById("mensagem").style.display = "inline";
                document.getElementById("mensagem").innerHTML = "Data invalida.";
    }
    else{
        
        let url = `http://localhost:3000/faturamento`

         a = {data:data}

        let res = axios.post(url, a).then(response => {
            if (response.data) {
                var linha = document.createElement("tr");

                document.getElementById("mensagem").style.display = "inline";
                document.getElementById("mensagem").innerHTML = "Faturamento da data " + data;

                document.getElementById("titulo-busca").innerHTML = "Faturamento";

                criaHeadTabela("faturamento");
                var new_tbody = document.createElement('tbody');
                
                var campo_valor = document.createElement("td");
                var campo_quantidade_pagos = document.createElement("td");

                var texto_valor = document.createTextNode("R$" + response.data.faturamentoTotal);
                var texto_pagos = document.createTextNode(response.data.ticketsPagos);

             
                campo_valor.appendChild(texto_valor);
                campo_quantidade_pagos.appendChild(texto_pagos);

        
                linha.appendChild(campo_valor);
                linha.appendChild(campo_quantidade_pagos);

                new_tbody.appendChild(linha);
                
                const corpo_tabela = document.querySelector("tbody");
                corpo_tabela.parentNode.replaceChild(new_tbody, corpo_tabela);

                }
        })
            .catch(error => {
                
                document.getElementById("mensagem").style.display = "inline";
                document.getElementById("mensagem").innerHTML = "Houve um erro, tente novamente.";
               
                var new_tbody = document.createElement('tbody');
                const corpo_tabela = document.querySelector("tbody");
                corpo_tabela.parentNode.replaceChild(new_tbody, corpo_tabela);

            })
    }
}

function criaHeadTabela(status){
    var linhaHead = document.createElement("tr");

                if(status != "faturamento"){

                var tag_codigo = document.createElement("th");
                var tag_placa = document.createElement("th");
                var tag_data_entrada = document.createElement("th");
                
                tag_codigo.appendChild(document.createTextNode("Codigo"));
                tag_placa.appendChild(document.createTextNode("Placa"));
                tag_data_entrada.appendChild(document.createTextNode("Data de entrada"));

                linhaHead.appendChild(tag_codigo);
                linhaHead.appendChild(tag_placa);
                linhaHead.appendChild(tag_data_entrada);

                if(status == "desbloqueado" || status == "finalizado"){
                    var tag_data_pagamento = document.createElement("th");
                    var tag_valor_estadia = document.createElement("th");

                    tag_data_pagamento.appendChild(document.createTextNode("Data de pagamento"));
                    tag_valor_estadia.appendChild(document.createTextNode("Valor estadia"));

                    linhaHead.appendChild(tag_data_pagamento);
                    linhaHead.appendChild(tag_valor_estadia);

                    if(status== "finalizado"){
                        var tag_data_saida = document.createElement("th");
                        tag_data_saida.appendChild(document.createTextNode("Data de saida"));
                        linhaHead.appendChild(tag_data_saida);

                    }
                }
            }

            if(status == "faturamento"){

            var tag_valor_total = document.createElement("th");
            var tag_tickets_pagos = document.createElement("th");

            tag_valor_total.appendChild(document.createTextNode("Valor Total"));
            tag_tickets_pagos.appendChild(document.createTextNode("Tickets pagos"));

            linhaHead.appendChild(tag_valor_total);
            linhaHead.appendChild(tag_tickets_pagos);
           
        }

                const headtabela = document.querySelector("thead");
                var novoHead = document.createElement("thead");

                novoHead.appendChild(linhaHead);
                headtabela.parentNode.replaceChild(novoHead, headtabela);

}



