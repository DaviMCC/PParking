var date = new Date();

var hhmmAtual = date.getHours();
hhmmAtual += ':'; 
hhmmAtual += date.getMinutes();

var inicial = "00:00", final = hhmmAtual;

var splInicial = inicial.split(":"), splFinal = final.split(":");

var inicialMin = (Number(splInicial[0] * 60)) + Number(splInicial[1]);
var finalMin = (Number(splFinal[0] * 60)) + Number(splFinal[1]);

var totalMin = Math.abs(Number(finalMin - inicialMin));
var tot = Math.trunc(totalMin / 60).toString() + ":" + (totalMin % 60).toString();

var totSplit = tot.split(":");
var diferencaEmSeg = (Number(totSplit[0] * 3600) + Number(totSplit[1]) * 60);

console.log(diferencaEmSeg);
