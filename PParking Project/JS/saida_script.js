function verificar_ticket()
{
    let estaPago = true;

    if (estaPago==true)
    {   
        exibirMensagem("Agradeçemos pela estadia!", "Seu ticket foi validado!");
    } 
    else 
    { 
        exibirMensagem("Retorne à cabine de pagamento para efetuar o pagamento", "Infelizmente seu ticket não foi validado...");
    }
    retornarHome();
    return false;
}
function exibirMensagem(mensagem, tituloMensagem){

        const p1 = document.querySelector('.digitacao-e-verificacao');
        p1.style.display = "none";
  
    document.getElementById("mensagem-inicial").innerHTML = tituloMensagem;

    document.getElementById("mensagem-instrucao").innerHTML = mensagem;

    const instrucao = document.querySelector('#mensagem-instrucao');
    instrucao.style.paddingTop = '160px';
    instrucao.style.fontSize = '45px';

    retornarHome();
}
function retornarHome(){

    setTimeout((() => {window.location.replace("cabine_saida.html")}), 10000);

}