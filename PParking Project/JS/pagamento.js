function checkout()
{
    const instrucao = document.getElementsByClassName("instrucao")[0].innerHTML = "Verifique as informações";

    const caixa1 = document.querySelector(".caixa1");
    caixa1.style.height = "890px";

    const p1 = document.querySelector('.p1 form');
    p1.style.display = "none";

    const p2 = document.querySelector('.p2');
    p2.style.display = "inline-block";

    return false;
}

function prosseguir()
{
    document.getElementsByClassName("instrucao")[0].innerHTML = "Selecione o metodo de pagamento";

    const p2 = document.querySelector('.p2');
    p2.style.display = "none";

    const p3 = document.querySelector('.p3');
    p3.style.display = "inline-block";

    const caixa1 = document.querySelector(".caixa1");
    caixa1.style.height = "750px";
}