const Web3 = require('web3');

//Providers
var providerTest = "wss://ropsten.infura.io/ws/v3/1cefe84e28d9495d8d305aa1d7ea414f";
var providerMain = 'wss://mainnet.infura.io/ws/v3/1cefe84e28d9495d8d305aa1d7ea414f';
var bnbProvider = 'wss://bsc-ws-node.nariox.org:443';
//Private Key
const privKey = 'SUA PRIVATE KEY';


//Config Vars
var balance = 0;
var tempBalance = 0;
var indexTentativas = 0;
const init_addr = 'ENDEREÇO DA WALLET QUE ESTA SENDO OBSERVADA';
const dest_addr = 'ENDEREÇO DA WALLET DESTINO, PARA ONDE SERA ENVIADO O BNB';

const options = {
    // Enable auto reconnection
    reconnect: {
        auto: true,
        delay: 5000, // ms
        maxAttempts: 5,
        onTimeout: false
    }
  };
const web3 = new Web3(bnbProvider,options);

initBalance();

cabecalho();

blockWatcher();











async function cabecalho(){
    console.log('Iniciando ASMODEUS.');
    await sleep(1000);
    console.log('Iniciando ASMODEUS..');
    await sleep(1000);    
    console.log('Iniciando ASMODEUS...');
    await sleep(900);    


    console.log("[==============================================================]");
    console.log("[========================ASMODEUS SCRIPT=======================]");
    console.log("[============================-V1.5-============================]")
    console.log("[==============================================================]");
    console.log("[==============================================================]");
    console.log("Preparando para escutar honeySpot wallet...");
    console.log("[==============================================================]");
}
//FUNÇÂO SLEEP
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//INICIA BLOCK WATCHER
function blockWatcher(){
    web3.eth.subscribe("newBlockHeaders", (err, result) => {
     
        if (err) {
            console.log('Ocorreu um erro ao escutar o bloco');
            console.log(err);
          } else {
            console.log("|---------------------------------------------------------------|");
            console.log("Bloco "+result.number+" minerado at "+timeConverter(result.timestamp));
            //updateBalance();
          }
        })
}
//Inicia o valor da carteira
function initBalance(){
    web3.eth.getBalance(init_addr).then(bal => {
        console.log("Conta::"+init_addr);
        console.log("Saldo::"+wtb(bal));
        balance = bal;
    }).catch(err => {
        console.log("Erro ao atualizar valor.");
    });
}
function updateBalance(){
    web3.eth.getBalance(init_addr).then(bal => {

        tempBalance = balance;
        balance = bal;
  
        estimateGas();
  
      
    });
}
function estimateGas(){

    web3.eth.getGasPrice().then((gasP)=>{
        web3.eth.estimateGas({
            from: init_addr,
        }).then((resEstimateGas)=>{
            var temp = balance - (gasP*resEstimateGas);
            if (temp>10) {
                console.log("[==============================================================]");
                console.log('GasPrice Wei='+gasP);

                setTransactionDetails(resEstimateGas, gasP);
            }else{console.log("Estou de olho... :D");}

    }).catch((err)=>{
        console.log('!!!!--------------------------------------------------------!!!!');
        console.log("Ocorreu um erro ao estimar gas por block.");
        console.log('!!!!--------------------------------------------------------!!!!');
        console.log(err);
        console.log('!!!!--------------------------------------------------------!!!!');
  
    });
    }).catch((err)=>{
        console.log('!!!!--------------------------------------------------------!!!!');
        console.log("Ocorreu um erro ao requisitar o valo do GAS.");
        console.log('!!!!--------------------------------------------------------!!!!');
        console.log(err);
        console.log('!!!!--------------------------------------------------------!!!!');
    });
}
function setTransactionDetails(resEstimateGas, gasP) {
          
            console.log("Estimated Gas="+resEstimateGas);
            console.log("Valor em conta::"+wtb(balance));
            amount = balance - (gasP*resEstimateGas);
            console.log("GasFee::"+(gasP*resEstimateGas));
            console.log(wtb(balance)+"-("+gasP+"(gwei)*"+resEstimateGas+"(gwei))="+wtb(amount));
            console.log("Valor a ser enviado::"+wtb(amount));
            console.log('Assinando transação...')
            web3.eth.accounts.signTransaction({
                from:init_addr,
                to: dest_addr,
                value: amount,
                gas: resEstimateGas,
                gasPrice: gasP,
                chainId: 3
            }, privKey)
            .then((res)=>{
                console.log('Iniciando envio da transação.')
                sendingTransaction(res);
            }).catch((err)=>{
                        console.log('!!!!--------------------------------------------------------!!!!');
                        console.log("Ocorreu um erro ao enviar o pagamento.");
                        console.log('!!!!--------------------------------------------------------!!!!');
  
            });
} 
function sendingTransaction(res){
    web3.eth.sendSignedTransaction(res.rawTransaction).then(()=>{
        console.log("[==============================================================]");
        console.log("TRANSAÇÃO REDIRECIONADA COM SUCESSO.");
        console.log("[==============================================================]");
        console.log("Verifique as informações da transação em:");
        console.log("https://etherscan.io/tx/"+res.transactionHash);
        console.log("[==============================================================]");
        web3.eth.getBalance(dest_addr).then((newBal)=>{
        console.log("O novo valor na conta main é:"+newBal);
        console.log("[==============================================================]");
      });
      web3.eth.getBalance(init_addr).then((newBal)=>{
        console.log("O novo valor na conta honeySpot é:"+newBal);
        balance=newBal;
        console.log("[==============================================================]");
      });
    }).catch((err)=>{
      indexTentativas=indexTentativas+1;
      if (indexTentativas >=2) {
        console.log("[==============================================================]");
        console.log("Erro ao interceptar pagamento. :(((");
        console.log("[==============================================================]");
        indexTentativas=0;
      }else{
        console.log('OCORREU UM ERRO AO REALIZAR O ENVIO')
        console.log('!!!!--------------------------------------------------------!!!!');
        balance = tempBalance;
      }
    });
}
function timeConverter(time){
    let unix_timestamp = time
// Create a new JavaScript Date object based on the timestamp
// multiplied by 1000 so that the argument is in milliseconds, not seconds.
var date = new Date(unix_timestamp * 1000);
// Hours part from the timestamp
var hours = date.getHours();
// Minutes part from the timestamp
var minutes = "0" + date.getMinutes();
// Seconds part from the timestamp
var seconds = "0" + date.getSeconds();

// Will display time in 10:30:23 format
var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

return formattedTime;
}
function wtb(valueInEther){
    valueInEther =""+valueInEther;
    valueInEther = web3.utils.fromWei(valueInEther, 'ether')+"BNB*";
    return valueInEther;
}


module.exports= this;