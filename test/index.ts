import { expect } from "chai";
import { ethers, waffle } from "hardhat";
import {Token, Token__factory, UniAdapter, UniAdapter__factory, WETH9, WETH9__factory} from "../typechain";

describe("uniAdapter", function () {

  let uniswapFactory: any;
  let router: any;
  let token1: Token;
  let token2: Token;
  let token3: Token;
  let WETH: WETH9;
  let adapter: UniAdapter;
  
  beforeEach(async () => {
    const [owner] = await ethers.getSigners();

    const tokenFactory = await ethers.getContractFactory("Token") as Token__factory;
    const wethFactory = await ethers.getContractFactory("WETH9") as WETH9__factory;
    token1 = await tokenFactory.deploy("ACDM","ACDM");
    token2 = await tokenFactory.deploy("TST","TST");
    token3 = await tokenFactory.deploy("path","path");
    WETH = await wethFactory.deploy();

    const compiledUniswapFactory = require("@uniswap/v2-core/build/UniswapV2Factory.json");
    uniswapFactory = await new ethers.ContractFactory(compiledUniswapFactory.interface,compiledUniswapFactory.bytecode,owner).deploy(await owner.getAddress());
  
    const compiledUniswapRouter = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
    router = await new ethers.ContractFactory(compiledUniswapRouter.abi,compiledUniswapRouter.bytecode,owner).deploy(uniswapFactory.address,WETH.address);
    
    const adapterFactory = await ethers.getContractFactory("UniAdapter") as UniAdapter__factory;
    adapter = await adapterFactory.deploy(uniswapFactory.address, router.address);
  });

  it("createPair", async function () {
    await adapter.createPair(token1.address, token2.address);
    const tx = await uniswapFactory.getPair(token1.address, token2.address);
    expect(tx).not.equal(ethers.constants.AddressZero);
  });

  it("addLiquidity", async function () {

    const [owner] = await ethers.getSigners();

    await token1.connect(owner).mint(owner.address, ethers.utils.parseEther("10"));
    await token2.connect(owner).mint(owner.address, ethers.utils.parseEther("10"));
    await token1.connect(owner).approve(adapter.address, ethers.utils.parseEther("10"));
    await token2.connect(owner).approve(adapter.address, ethers.utils.parseEther("5"));
    
    const blockNum = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNum);
    const timestamp= block.timestamp;
    
    await adapter.createPair(token1.address, token2.address);

    const hre = require("hardhat");
    const pairAddress = await uniswapFactory.getPair(token1.address, token2.address);
    const pair = require("@uniswap/v2-core/build/UniswapV2Pair.json");

    const pairContract = await hre.ethers.getContractAt(pair.abi, pairAddress);
    const balBefore = await pairContract.balanceOf(owner.address);
    expect(balBefore).to.equal(0);

    await adapter.connect(owner).addLiquidity(
      token1.address,
      token2.address,
      ethers.utils.parseEther("1"),
      ethers.utils.parseEther("1"),
      ethers.utils.parseEther("1"),
      ethers.utils.parseEther("1"),
      owner.address,
      timestamp + 10
    );

    const balAfter = await pairContract.balanceOf(owner.address);
    expect(balAfter).not.equal(0);
    
    
    const res = await pairContract.getReserves();
  });

  it("addLiquidityETH", async function () {

    const [owner] = await ethers.getSigners();

    await token1.connect(owner).mint(owner.address, ethers.utils.parseEther("10"));
    await token1.connect(owner).approve(adapter.address, ethers.utils.parseEther("10"));
    
    const blockNum = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNum);
    const timestamp= block.timestamp;
    
    await adapter.createPair(token1.address, await router.WETH());

    const hre = require("hardhat");
    const pairAddress = await uniswapFactory.getPair(token1.address, await router.WETH());
    const pair = require("@uniswap/v2-core/build/UniswapV2Pair.json");
    const pairContract = await hre.ethers.getContractAt(pair.abi, pairAddress);

    const balBefore = await pairContract.balanceOf(owner.address);
    expect(balBefore).to.equal(0);

    await adapter.connect(owner).addLiquidityETH(
      token1.address,
      ethers.utils.parseEther("1"),
      ethers.utils.parseEther("0.9"),
      ethers.utils.parseEther("0.9"),
      owner.address,
      timestamp + 10,
      {value: ethers.utils.parseEther("1")}
    );

    const balAfter = await pairContract.balanceOf(owner.address);
    expect(balAfter).not.equal(0);
  });

  it("token price", async function () {

    const [owner] = await ethers.getSigners();

    await token1.connect(owner).mint(owner.address, ethers.utils.parseEther("501"));
    await token2.connect(owner).mint(owner.address, ethers.utils.parseEther("251"));
    await token1.connect(owner).approve(adapter.address, ethers.utils.parseEther("501"));
    await token2.connect(owner).approve(adapter.address, ethers.utils.parseEther("251"));
    
    const blockNum = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNum);
    const timestamp= block.timestamp;
    
    await adapter.createPair(token1.address, token2.address);

    const hre = require("hardhat");
    const pairAddress = await uniswapFactory.getPair(token1.address, token2.address);

    const pair = require("@uniswap/v2-core/build/UniswapV2Pair.json");
    const pairContract = await hre.ethers.getContractAt(pair.abi, pairAddress);

    await token1.connect(owner).transfer(pairAddress, ethers.utils.parseEther("0.1"));
    await token2.connect(owner).transfer(pairAddress, ethers.utils.parseEther("0.1"));

    await adapter.connect(owner).addLiquidity(
      token1.address,
      token2.address,
      ethers.utils.parseEther("500"),
      ethers.utils.parseEther("250"),
      ethers.utils.parseEther("500"),
      ethers.utils.parseEther("250"),
      owner.address,
      timestamp + 10
    );

    const aprice = await adapter.getTokenAPrice(pairContract.address);
    const bprice = await adapter.getTokenBPrice(pairContract.address);
    
    expect((ethers.utils.formatEther(aprice)).slice(0,4)).to.equal("1.99");
    expect((ethers.utils.formatEther(bprice)).slice(0,4)).to.equal("0.50");
  });


  it("removeLiquidity", async function () {

    const [owner] = await ethers.getSigners();

    await token1.connect(owner).mint(owner.address, ethers.utils.parseEther("10"));
    await token2.connect(owner).mint(owner.address, ethers.utils.parseEther("10"));
    await token1.connect(owner).approve(adapter.address, ethers.utils.parseEther("10"));
    await token2.connect(owner).approve(adapter.address, ethers.utils.parseEther("5"));
    
    const blockNum = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNum);
    const timestamp= block.timestamp;
    
    await adapter.createPair(token1.address, token2.address);

    const hre = require("hardhat");
    const pairAddress = await uniswapFactory.getPair(token1.address, token2.address);
    const pair = require("@uniswap/v2-core/build/UniswapV2Pair.json");
    const pairContract = await hre.ethers.getContractAt(pair.abi, pairAddress);

    await token1.connect(owner).transfer(pairAddress, ethers.utils.parseEther("0.1"));
    await token2.connect(owner).transfer(pairAddress, ethers.utils.parseEther("0.1"));

    await adapter.connect(owner).addLiquidity(
      token1.address,
      token2.address,
      ethers.utils.parseEther("1"),
      ethers.utils.parseEther("1"),
      ethers.utils.parseEther("1"),
      ethers.utils.parseEther("1"),
      owner.address,
      timestamp + 10
    );

    await pairContract.connect(owner).approve(adapter.address, ethers.utils.parseEther("0.2"));
    const balBefore = await pairContract.balanceOf(owner.address);

    await adapter.connect(owner).removeLiquidity(
      token1.address,
      token2.address,
      ethers.utils.parseEther("0.1"),
      ethers.utils.parseEther("0.001"),
      ethers.utils.parseEther("0.001"),
      owner.address,
      timestamp + 10
    );

    const balAfter = await pairContract.balanceOf(owner.address);
    expect(balAfter).not.equal(balBefore);
  });

  it("removeLiquidityETH", async function () {

    const [owner] = await ethers.getSigners();

    await token1.connect(owner).mint(owner.address, ethers.utils.parseEther("10"));
    await token1.connect(owner).approve(adapter.address, ethers.utils.parseEther("10"));
    
    const blockNum = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNum);
    const timestamp= block.timestamp;
    
    await adapter.createPair(token1.address, await router.WETH());

    const hre = require("hardhat");
    const pairAddress = await uniswapFactory.getPair(token1.address, await router.WETH());
    const pair = require("@uniswap/v2-core/build/UniswapV2Pair.json");
    const pairContract = await hre.ethers.getContractAt(pair.abi, pairAddress);

    await adapter.connect(owner).addLiquidityETH(
      token1.address,
      ethers.utils.parseEther("1"),
      ethers.utils.parseEther("1"),
      ethers.utils.parseEther("1"),
      owner.address,
      timestamp + 10,
      {value: ethers.utils.parseEther("1")}
    );
    
    await pairContract.connect(owner).approve(adapter.address, ethers.utils.parseEther("0.1"));
    const provider = waffle.provider;
    const balBeforeToken = await token1.balanceOf(owner.address);
    const balBeforeETH = await provider.getBalance(owner.address);
    
    await adapter.connect(owner).removeLiquidityETH(
      token1.address,
      ethers.utils.parseEther("0.01"),
      ethers.utils.parseEther("0.001"),
      ethers.utils.parseEther("0.001"),
      owner.address,
      timestamp + 10
    );

    const balAfterToken = await token1.balanceOf(owner.address);
    const balAfterETH = await provider.getBalance(owner.address);
  
    expect(balAfterToken).not.equal(balBeforeToken);
    expect(balAfterETH).not.equal(balBeforeETH);
  });

  it("swap", async function () {

    const [owner] = await ethers.getSigners();

    await token1.connect(owner).mint(owner.address, ethers.utils.parseEther("10"));
    await token2.connect(owner).mint(owner.address, ethers.utils.parseEther("10"));
    await token1.connect(owner).approve(adapter.address, ethers.utils.parseEther("10"));
    await token2.connect(owner).approve(adapter.address, ethers.utils.parseEther("5"));
    
    const blockNum = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNum);
    const timestamp= block.timestamp;
    
    await adapter.createPair(token1.address, token2.address);

    const hre = require("hardhat");
    const pairAddress = await uniswapFactory.getPair(token1.address, token2.address);
    const pair = require("@uniswap/v2-core/build/UniswapV2Pair.json");
    const pairContract = await hre.ethers.getContractAt(pair.abi, pairAddress);

    await token1.connect(owner).transfer(pairAddress, ethers.utils.parseEther("0.1"));
    await token2.connect(owner).transfer(pairAddress, ethers.utils.parseEther("0.1"));

    await adapter.connect(owner).addLiquidity(
      token1.address,
      token2.address,
      ethers.utils.parseEther("1"),
      ethers.utils.parseEther("1"),
      ethers.utils.parseEther("1"),
      ethers.utils.parseEther("1"),
      owner.address,
      timestamp + 10
    );

    const balBeforeToken1 = await token1.balanceOf(owner.address);
    const balBeforeToken2 = await token2.balanceOf(owner.address);

    await adapter.connect(owner).swapExactTokensForTokens(
      ethers.utils.parseEther("0.1"),
      ethers.utils.parseEther("0.09"),
      [token1.address, token2.address],
      owner.address,
      timestamp + 10 
    );

    const balAfterToken1 = await token1.balanceOf(owner.address);
    const balAfterToken2 = await token2.balanceOf(owner.address);

    expect(balAfterToken1).not.equal(balBeforeToken1);
    expect(balAfterToken2).not.equal(balBeforeToken2);

  });

  it("swapExactTokensForTokens", async function () {

    const [owner] = await ethers.getSigners();

    await token1.connect(owner).mint(owner.address, ethers.utils.parseEther("10"));
    await token2.connect(owner).mint(owner.address, ethers.utils.parseEther("10"));
    await token3.connect(owner).mint(owner.address, ethers.utils.parseEther("10"));

    await token1.connect(owner).approve(adapter.address, ethers.utils.parseEther("10"));
    await token2.connect(owner).approve(adapter.address, ethers.utils.parseEther("10"));
    await token3.connect(owner).approve(adapter.address, ethers.utils.parseEther("10"));

    const blockNum = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNum);
    const timestamp= block.timestamp;

    await adapter.connect(owner).addLiquidity(
      token1.address,
      token2.address,
      ethers.utils.parseEther("5"),
      ethers.utils.parseEther("3"),
      ethers.utils.parseEther("5"),
      ethers.utils.parseEther("3"),
      owner.address,
      timestamp + 10
    );

    await adapter.connect(owner).addLiquidity(
      token2.address,
      token3.address,
      ethers.utils.parseEther("2"),
      ethers.utils.parseEther("1"),
      ethers.utils.parseEther("2"),
      ethers.utils.parseEther("1"),
      owner.address,
      timestamp + 10
    );

    const balBeforeToken1 = await token1.balanceOf(owner.address);
    const balBeforeToken3 = await token3.balanceOf(owner.address);

    await adapter.connect(owner).swapExactTokensForTokens(
      ethers.utils.parseEther("1"),
      ethers.utils.parseEther("0.19"),
      [token1.address, token2.address, token3.address],
      owner.address,
      timestamp + 10 
    );

    const balAfterToken1 = await token1.balanceOf(owner.address);
    const balAfterToken3 = await token3.balanceOf(owner.address);

    expect(balAfterToken1).not.equal(balBeforeToken1);
    expect(balAfterToken3).not.equal(balBeforeToken3);

  });

});