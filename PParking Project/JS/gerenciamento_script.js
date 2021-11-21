function limpaDados(){
    const person = {
        name: "teste",
        teste: 30,
        teste: "teste"
      }
      document.getElementById("titulo-dados").innerHTML = person.name + person.age;

}

function getBloqueados()
{
    document.getElementById("titulo-busca").innerHTML = "Bloqueados";
    limpaDados();
}

function getDesbloqueados()
{
    document.getElementById("titulo-busca").innerHTML = "Desbloqueados";
    limpaDados();

}

function getEncerrados()
{
    document.getElementById("titulo-busca").innerHTML = "Encerrados";
    limpaDados();

}

function getFaturamento()
{
    document.getElementById("titulo-busca").innerHTML = "Registro de faturamento";
    limpaDados();

}

