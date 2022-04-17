import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import { task } from "hardhat/config";

task("create-pair", "create pair based on 2 address")
    .addParam("address","address for adapter")
    .addParam("address0","token0")
    .addParam("address1","token1")
    .setAction (async (taskArgs, hre) => {
    
    const adapterFactory = await hre.ethers.getContractFactory("UniAdapter");
    const accounts = await hre.ethers.getSigners();
    
    const adapterContract = new hre.ethers.Contract(
        taskArgs.address,
        adapterFactory.interface,
        accounts[0]
    );

    const tx = await adapterContract.createPair(taskArgs.address0, taskArgs.address1);

    console.log(
        `tx hash: ${tx.hash}`
    );
});


task("add-liq", "create pair based on 2 address")
    .addParam("address","address for adapter")
    .addParam("address0","token0")
    .addParam("address1","token1")
    .addParam("amount0","amount0")
    .addParam("amount1","amount1")
    .setAction (async (taskArgs, hre) => {
    
    const adapterFactory = await hre.ethers.getContractFactory("UniAdapter");
    const tokenFactory = await hre.ethers.getContractFactory("Token");
    const accounts = await hre.ethers.getSigners();
    
    const adapterContract = new hre.ethers.Contract(
        taskArgs.address,
        adapterFactory.interface,
        accounts[0]
    );

    const token0Contract = new hre.ethers.Contract(
        taskArgs.address0,
        tokenFactory.interface,
        accounts[0]
    );

    const token1Contract = new hre.ethers.Contract(
        taskArgs.address1,
        tokenFactory.interface,
        accounts[0]
    );

    const approveToken0 = await token0Contract.approve(
        taskArgs.address, 
        hre.ethers.utils.parseEther(taskArgs.amount0)
    );
    const approveToken1 = await token1Contract.approve(
        taskArgs.address, 
        hre.ethers.utils.parseEther(taskArgs.amount1)
    );

    console.log(
        `approve hash: ${approveToken0.hash}, ${approveToken1.hash}`
    );

    const tx = await adapterContract.addLiquidity(
        taskArgs.address0, 
        taskArgs.address1, 
        hre.ethers.utils.parseEther(taskArgs.amount0),
        hre.ethers.utils.parseEther(taskArgs.amount1),
        0,
        0,
        accounts[0].address,
        1660134274
    );

    console.log(
        `tx hash: ${tx.hash}`
    );
});

task("remove-liq", "remove liquidity")
    .addParam("address","address for adapter")
    .addParam("address0","token0")
    .addParam("address1","token1")
    .addParam("liq","liquidity")
    .setAction (async (taskArgs, hre) => {
    
    const adapterFactory = await hre.ethers.getContractFactory("UniAdapter");
    const tokenFactory = await hre.ethers.getContractFactory("Token");
    const accounts = await hre.ethers.getSigners();
    
    const adapterContract = new hre.ethers.Contract(
        taskArgs.address,
        adapterFactory.interface,
        accounts[0]
    );
    //Factory address in kovan:0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f
    const factoryInterface = require("@uniswap/v2-core/build/UniswapV2Factory.json").interface;
    const factoryContract = new hre.ethers.Contract(
        "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
        factoryInterface,
        accounts[0]
    );

    const addr = await factoryContract.getPair(taskArgs.address0, taskArgs.address1);
    const pairInterface = require("@uniswap/v2-core/build/UniswapV2Pair.json").interface;
    const pairContract = new hre.ethers.Contract(
        addr,
        pairInterface,
        accounts[0]
    );

    const approveUniV2 = await pairContract.approve(adapterContract.address, hre.ethers.utils.parseEther(taskArgs.liq));

    console.log(
        `approve hash: ${approveUniV2.hash}`
    );

    const tx = await adapterContract.removeLiquidity(
        taskArgs.address0,
        taskArgs.address1,
        hre.ethers.utils.parseEther(taskArgs.liq),
        1,
        1,
        accounts[0].address,
        1660134274
    );

    console.log(
        `hash: ${tx.hash}`
    );
});


task("add-liq-eth", "add liquidity in eth")
    .addParam("address","address for adapter")
    .addParam("addrweth","weth addr")
    .addParam("address1","token1")
    .addParam("amount0","amount in eth")
    .addParam("amount1","amount1")
    .setAction (async (taskArgs, hre) => {
    
    const adapterFactory = await hre.ethers.getContractFactory("UniAdapter");
    const tokenFactory = await hre.ethers.getContractFactory("Token");
    const wethFactory = await hre.ethers.getContractFactory("WETH9");
    const accounts = await hre.ethers.getSigners();
    
    const adapterContract = new hre.ethers.Contract(
        taskArgs.address,
        adapterFactory.interface,
        accounts[0]
    );

    const wethContract = new hre.ethers.Contract(
        taskArgs.addrweth,
        wethFactory.interface,
        accounts[0]
    );

    const token1Contract = new hre.ethers.Contract(
        taskArgs.address1,
        tokenFactory.interface,
        accounts[0]
    );
    

    const sendEth = await wethContract.deposit(
        {value: hre.ethers.utils.parseEther(taskArgs.amount0)}
    );

    console.log(
        `send eth: ${sendEth.hash}`
    );

    const approveEth = await wethContract.approve(
        taskArgs.address,
        hre.ethers.utils.parseEther(taskArgs.amount0)
    );
    
    const approveToken1 = await token1Contract.approve(
        taskArgs.address, 
        hre.ethers.utils.parseEther(taskArgs.amount1)
    );

    console.log(
        `approve hash: ${approveEth.hash}, ${approveToken1.hash}`
    );

    const tx = await adapterContract.addLiquidityETH(
        taskArgs.address1, 
        hre.ethers.utils.parseEther(taskArgs.amount1), 
        0,
        0,
        accounts[0].address,
        1660134274,
        {value: hre.ethers.utils.parseEther(taskArgs.amount0)}
    );

    console.log(
        `tx hash: ${tx.hash}`
    );
});

task("remove-liq-eth", "remove liquidity")
    .addParam("address","address for adapter")
    .addParam("pairaddr","address for pair")
    .addParam("address1","token1")
    .addParam("liq","liquidity")
    .setAction (async (taskArgs, hre) => {
    
    const adapterFactory = await hre.ethers.getContractFactory("UniAdapter");
    const accounts = await hre.ethers.getSigners();
    const lpTokenInterface = require("@uniswap/v2-core/build/UniswapV2Pair.json").interface;

    const adapterContract = new hre.ethers.Contract(
        taskArgs.address,
        adapterFactory.interface,
        accounts[0]
    );

    const lpTokensContract = new hre.ethers.Contract(
        taskArgs.pairaddr,
        lpTokenInterface,
        accounts[0]
    );

    const approve = await lpTokensContract.approve(
        taskArgs.address,
        hre.ethers.utils.parseEther(taskArgs.liq)
    );

    console.log(
        `approve: ${approve.hash}`
    );

    const tx = await adapterContract.removeLiquidityETH(
        taskArgs.address1,
        hre.ethers.utils.parseEther(taskArgs.liq),
        0,
        0,
        accounts[0].address,
        1660134274
    );

    console.log(
        `hash: ${tx.hash}`
    );
});


task("swap", "swap with max out")
    .addParam("address","address for adapter")
    .addParam("address0","token0")
    .addParam("address1","token1")
    .addParam("amount0","amount of token0")
    .setAction (async (taskArgs, hre) => {
    
    const adapterFactory = await hre.ethers.getContractFactory("UniAdapter");
    const tokenFactory = await hre.ethers.getContractFactory("Token");
    const accounts = await hre.ethers.getSigners();

    const adapterContract = new hre.ethers.Contract(
        taskArgs.address,
        adapterFactory.interface,
        accounts[0]
    );

    const token0Contract = new hre.ethers.Contract(
        taskArgs.address0,
        tokenFactory.interface,
        accounts[0]
    );

    const approve = await token0Contract.approve(
        taskArgs.address,
        hre.ethers.utils.parseEther(taskArgs.amount0)
    );

    console.log(
        `approve: ${approve.hash}`
    );

    const tx = await adapterContract.swapExactTokensForTokens(
        hre.ethers.utils.parseEther(taskArgs.amount0),
        0,
        [taskArgs.address0, taskArgs.address1],
        accounts[0].address,
        1660134274
    );

    console.log(
        `hash: ${tx.hash}`
    );
});

task("swap-path", "swap with path")
    .addParam("address","address for adapter")
    .addParam("path","path: addr1,addr2..")
    .addParam("amount0","amount of token0")
    .setAction (async (taskArgs, hre) => {
    var arrPath = taskArgs.path.split(','); // split string on comma space
    

    const adapterFactory = await hre.ethers.getContractFactory("UniAdapter");
    const tokenFactory = await hre.ethers.getContractFactory("Token");
    const accounts = await hre.ethers.getSigners();

    const adapterContract = new hre.ethers.Contract(
        taskArgs.address,
        adapterFactory.interface,
        accounts[0]
    );

    const token0Contract = new hre.ethers.Contract(
        arrPath[0],
        tokenFactory.interface,
        accounts[0]
    );

    const approve = await token0Contract.approve(
        taskArgs.address,
        hre.ethers.utils.parseEther(taskArgs.amount0)
    );

    console.log(
        `approve: ${approve.hash}`
    );

    const tx = await adapterContract.swapExactTokensForTokens(
        hre.ethers.utils.parseEther(taskArgs.amount0),
        0,
        arrPath,
        accounts[0].address,
        1660134274
    );

    console.log(
        `hash: ${tx.hash}`
    );
});