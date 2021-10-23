function gerar_ticket()
{
    const insercaoDeDados = document.querySelector(".div-insercao-dados")
    insercaoDeDados.style.display= "none"   

    const mensagemInicial = document.getElementById("mensagem-inicial").innerHTML = "Aproveite a estadia!";

    const mensagemInstrucao = document.getElementById("mensagem-instrucao").innerHTML = "Retire o seu ticket";

    const informacoes = document.querySelector(".p1")
    informacoes.style.display = "inline-block";

    retornarHome();

}

function alertarErro(mensagem){    
            
        const insercaoDeDados = document.querySelector(".div-insercao-dados")
        insercaoDeDados.style.display= "none" 
    
        document.getElementById("mensagem-inicial").innerHTML = "Ops! Algo deu errado!";
    
        document.getElementById("mensagem-instrucao").innerHTML = mensagem;
    
        const instrucao = document.querySelector('#mensagem-instrucao');
        instrucao.style.paddingTop = '160px';
        instrucao.style.fontSize = '45px';
    
        retornarHome();
    
}

function retornarHome(){

        setTimeout((() => {window.location.replace("cabine_entrada.html")}), 10000);
    
    return false;
}