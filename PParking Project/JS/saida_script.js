function verificar_ticket()
{
    let estaPago = false;
    
    const p1 = document.querySelector('.digitacao-e-verificacao');

    const mensagemInicial = document.getElementById("mensagem-inicial")

    const mensagemInstrucao = document.getElementById("mensagem-instrucao")

    if (estaPago==true)
    {   
        document.getElementById("mensagem-inicial").innerHTML = "Seu ticket foi validado!";

        document.getElementById("mensagem-instrucao").innerHTML = "Agradeçemos pela estadia!";

        p1.style.display = "none";

    } 
    else 
    { 
        document.getElementById("mensagem-inicial").innerHTML = "Infelizmente seu ticket não foi validado...";

        document.getElementById("mensagem-instrucao").innerHTML = "Retorne à cabine de pagamento para efetuar o pagamento";

        p1.style.display = "none";
    }

    return false;
}