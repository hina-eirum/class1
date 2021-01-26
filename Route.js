var express=require ('express')
var morgan=require ('morgan')
var body_parser=require('body-parser')
var http=require('http')
var port=process.argv[2]
const Blockchain=require ('./prototypeBlock.js')

//var request = require('request');
//var fetch = require('node-fetch');

const Block=new Blockchain()

var app=express();
var server=http.createServer(app)
app.use(morgan('dev'))
app.use(body_parser.json())


app.get('/',(req,res)=>{
    res.sendFile(__dirname + '/index.html')
})
// app.get('/mine',(req,res)=>{
//     var block=Block.createNewBlock()
//     res.json(block)
// })

// BROADCAST A NEW TRANSACTION :
app.post('/txAndBroadcast',(req,res)=>{
    var txData  = Block.createNewTx(req.body.amount,req.body.sender,req.body.receiver)
    Block.addTransToMemPool(txData)
    var promises=[]   // Now BroadCast to all netwrkNodes
    Block.networkNodes.forEach((nodeurl)=>{    
        var apiRequest={
            method:'POST',
			uri:nodeurl+'/addTx',
			body:{tx:txData},
			json:true
        }
        promises.push(request(apiRequest))

	})
    Promise.all(promises).then((data)=>{
		res.json({"msg":"Transaction Is BroadCast Successfully !"})
	}) 
})

// Receiving new transactions
app.post('/addTx',(req,res)=>{
	var txData = req.body.tx
	Block.addTransToMemPool(txData)
	console.log("New Transaction Is Received")
	return res.json({"msg":"New Transaction Received"})
})

// Mine New Block and BroadCast to network :
app.get('/mineAndBroadcast',(req,res)=>{
	console.log(Block)
	var block = Block.createNewBlock();
	var reward = Block.createNewTx(12,"00000",Block.nodeAddress)
	console.log("Reward :")
	console.log(reward)
	Block.addTransToMemPool(reward)

// BroadCasting Block to all networknodes :
var promises = [];
Block.networkNodes.forEach((nodeurl)=>{
	var apiRequest1 = {
		method:'POST',
		uri:nodeurl+'/receive-new-block',
		body:{blockData:block},
		json:true
	}
	promises.push(request(apiRequest1))
})
Promise.all(promises).then((data)=>{

//BroadCasting REWARD TRANSACTION to All networknodes :
	var promises2 = [];
	Block.networkNodes.forEach((nodeurl)=>{
		var apiRequest2 = {
			method:'POST',
			uri:nodeurl+'/addTx',
			body:{tx:reward},
			json:true
		}
		promises2.push(request(apiRequest2))
	})
	Promise.all(promises2).then((data)=>{
		 res.json({"msg":"Block Mined and Broadcast Successfully"})
	})		
	}) //return
	res.json({'success':true,'msg':'Block Mined Successfully','block':block})
})

// Receiving New Blocks :
app.post('/receive-new-block',(req,res)=>{
	var block = req.body.blockData;
	var index = Block.chain.length;
	var latest = Block.chain[index-1];
	if(latest.hash == block.previousHash && index == block.height ){
		Block.chain.push(block)
		Block.memPool = []
		res.json({"msg":"New Block Received"})
	}else{
		res.json({"msg":"Block Rejected"})
	}
})

// app.get('/genesisblock',(req,res)=>{
//     var block=Block.createGenesisBlock()
//     res.json(block)
// })

app.get('/blockchain',(req,res)=>{
    res.json(Block)
})

// GET ALL BLOCKS :
app.get('/blocks',(req,res)=>{
    res.json(Block.chain)
})

// GET BLOCKS BY Height :
app.get('/blockByHeight/:height',(req,res)=>{
    var Height =parseInt(req.params.height)
    var Hi=null;
    Block.chain.forEach((element)=>{
        if(Height== element.height){
			Hi=element;
		}	
	})
    res.json(Hi)
})

// GET BLOCKS BY Hash :
app.get('/blockByHash/:hash',(req,res)=>{
    var hash =req.params.hash
    var Hash=null
    Block.chain.forEach((element)=>{
        if(hash== element.hash){
            Hash=element
        }
    })
    res.json(Hash)
})

// GET ALL Txs :
app.get('/txs',(req,res)=>{
	var x=Block.chain.transactions
	var i=null
	Block.chain.forEach((element)=>{
		if(element.transactions == x){
			i=element
		}
	})
    res.json(i)
})

// GET SPECIFIC TX DATA BY TX HASH :
app.get('/txByHash/:txhash',(req,res)=>{
	var txs = req.params.txHash;
	var tH = null;
	Block.chain.forEach((element)=>{
		element.txs.forEach((T)=>{
			if(txs == element.txHash){
				tH = T
			}
		})
	})
	res.json(tH)
})

//get txs by Having Address in receiver or sender:
app.get('/address/:address',(req,res)=>{
	var address = req.params.name         //  sender || receiver;
	var A = null;
	Block.chain.forEach((element)=>{
		element.transactions.forEach((Name)=>{
			if(address == Name.sender || address == Name.receiver){
				A = Name
			}
		})
	})
	res.json(A)
})

// REGISTER NEW NODE IN THE NETWORK :
app.post('/register-node',(req,res)=>{
	var newNetworkNode = req.body.newNodeUrl
	if(Block.networkNodes.indexOf(newNetworkNode) == -1 && newNetworkNode != Block.currentNodeURL){
		Block.networkNodes.push(newNetworkNode)
		res.json({"msg":"Node Is Registered Successfully"});
	}else{
		res.json({"msg":"Registeration Failed"})
	}
})

// REGISTER NODES IN BULK IN THE NETWORK :
app.post('/register-node-bulk',(req,res)=>{
	var bulkNodes = req.body.bulkNodes;
	bulkNodes.forEach((nodeUrl,index)=>{
		if(Block.networkNodes.indexOf(nodeUrl) == -1 && nodeUrl != Block.currentNodeURL){
			Block.networkNodes.push(nodeUrl)
		}
	})
	res.json({"msg":"Bulk Node Registration Is Done !!"})
})

//// REGISTER NEW NODE AND BROADCAST IT TO THE WHOLE NETWORK :
app.post('/Register-And-Broadcast',(req,res)=>{
	var newNodeURL = req.body.newNodeurl;
	if(Block.networkNodes.indexOf(newNodeURL) == -1 && newNodeURL != Block.currentNodeURL){
		Block.networkNodes.push(newNodeURL)
		var promises = [];
		Block.networkNodes.forEach((nodeurl)=>{
			var apiRequest = {
				method:'POST',
				url:nodeurl+'/register-node-bulk',
				body:{bulkNodes:[...Block.networkNodes,Block.currentNodeURL]},
				json:true
			}
			promises.push(request(apiRequest))
		})
		Promise.all(promises).then((data)=>{
			res.json({"msg":"Nodes Broadcast Is Successfully Done !!"})
		})

	}else{
		res.json({"msg":"Registeration Failed"})
	}
})

// FIND (LONGEST + VALID) CHAIN IN NETWORK & REPLACE SELF-DATA BY LONGEST CHAIN DATA :
app.get('/consensus', (req,res)=>{
	var promises = [];
	Block.networkNodes.forEach(nodeurl =>{
		var fetch1 = fetch(nodeurl+'/Block').then(data=>data.json())
		promises.push(fetch1)
 	})
	Promise.all(promises).then((blockchains) =>{
		var currentLongestChainLength = Block.chain.length;
		var longestChain = null
		var updatedMempool = null
		blockchains.forEach((item)=>{
			if(item.chain.length > currentLongestChainLength){
				if(Block.chainIsValid(item.chain)){
					longestChain = item.chain;
					updatedMempool = item.mempool;
					currentLongestChainLength = item.chain.length
				}
			}
		})
		if(longestChain){
			Block.chain = longestChain
			Block.memPool = updatedMempool
			res.json({"msg":"Blockchain Is Updated Successfully !!"})
 		}
 		else{
 			res.json({"msg":"Your Blockchain is already upto date!!"})
 		}
	})
});

server.listen(port,()=>{
    console.log('Port '+port+'\nServer is Running...')
})