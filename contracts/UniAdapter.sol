//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "./interfaces/IERC20.sol";

contract UniAdapter {
    address public uniswapFactory;
    address public uniswapRouter;

    constructor(address factoryAddr, address routerAddr) public {
        uniswapFactory = factoryAddr;
        uniswapRouter = routerAddr;
    }

    function getPair(address tokenA, address tokenB) public view returns(address){
        return IUniswapV2Factory(uniswapFactory).getPair(tokenA, tokenB);
    }

    function createPair(address tokenA, address tokenB) public returns(address) {
        return IUniswapV2Factory(uniswapFactory).createPair(tokenA, tokenB);
    }

    function getTokenAPrice(address pair) public view returns(uint) {
        (uint resA, uint resB,) = IUniswapV2Pair(pair).getReserves();
        uint8 decTokenA = IERC20(IUniswapV2Pair(pair).token0()).decimals();

        return (resA * (10**decTokenA))/resB;
    }

    function getTokenBPrice(address pair) public view returns(uint) {
        (uint resA, uint resB,) = IUniswapV2Pair(pair).getReserves();
        uint8 decTokenB = IERC20(IUniswapV2Pair(pair).token1()).decimals();

        return (resB * (10**decTokenB))/resA;
    }

    function addLiquidity(
        address tokenA, 
        address tokenB, 
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) public returns(uint amountA, uint amountB, uint liquidity) {

        IERC20(tokenA).transferFrom(msg.sender, address(this), amountADesired);
        IERC20(tokenB).transferFrom(msg.sender, address(this), amountBDesired);

        IERC20(tokenA).approve(uniswapRouter, amountADesired);
        IERC20(tokenB).approve(uniswapRouter, amountBDesired);
        
        (amountA, amountB, liquidity) = IUniswapV2Router02(uniswapRouter)
        .addLiquidity(
            tokenA, 
            tokenB, 
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin,
            to,
            deadline
        );

        amountADesired -= amountA;
        amountBDesired -= amountB;

        IERC20(tokenA).transfer(msg.sender, amountADesired);
        IERC20(tokenB).transfer(msg.sender, amountBDesired);
    }

    function addLiquidityETH(
        address token, 
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) public payable returns(uint amountToken, uint amountETH, uint liquidity) {

        uint valueToSend = msg.value;
        IERC20(token).transferFrom(msg.sender, address(this), amountTokenDesired);
        IERC20(token).approve(uniswapRouter, amountTokenDesired);

        (amountToken, amountETH, liquidity) = IUniswapV2Router02(uniswapRouter)
        .addLiquidityETH{value: valueToSend}(
            token, 
            amountTokenDesired, 
            amountTokenMin,
            amountETHMin,
            to,
            deadline
        );

        amountTokenDesired -= amountToken;
        valueToSend -= amountETH;

        IERC20(token).transfer(msg.sender, amountTokenDesired);
        payable(msg.sender).transfer(valueToSend);
    }


    function removeLiquidity(
        address tokenA, 
        address tokenB, 
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) public returns(uint amountA, uint amountB){

        address pair = getPair(tokenA, tokenB);
        IERC20(pair).transferFrom(msg.sender, address(this), liquidity);
        IERC20(pair).approve(uniswapRouter, liquidity);

        (amountA, amountB) = IUniswapV2Router02(uniswapRouter)
        .removeLiquidity(
                tokenA, 
                tokenB, 
                liquidity,
                amountAMin,
                amountBMin,
                to,
                deadline
        );
    }

    function removeLiquidityETH(
        address token, 
        uint liquidity, 
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) public payable returns(uint amountToken, uint amountETH){

        address pair = getPair(token, IUniswapV2Router02(uniswapRouter).WETH());
        
        IERC20(pair).transferFrom(msg.sender, address(this), liquidity);
        IERC20(pair).approve(uniswapRouter, liquidity);
        
        (amountToken, amountETH) = IUniswapV2Router02(uniswapRouter)
        .removeLiquidityETH(
                token, 
                liquidity, 
                amountTokenMin,
                amountETHMin,
                to,
                deadline
        );
    }

    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) public returns (uint[] memory amounts) {

        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);
        IERC20(path[0]).approve(uniswapRouter, amountIn);

        amounts = IUniswapV2Router02(uniswapRouter)
        .swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            to,
            deadline
        );
    }

    
}
