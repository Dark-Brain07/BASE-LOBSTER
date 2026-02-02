const { ethers } = require("ethers");

async function main() {
    const TOKEN_ADDRESS = "0xFdf71B8b3d2F08c8728ee56fB64C283B19BeAEd8";
    const TEST_ADDRESS = "0x7EEcBD64e03Cdb4fbdADfbB786c639eEf340621F";

    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");

    const TOKEN_ABI = [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function balanceOf(address) view returns (uint256)",
        "function getVotes(address) view returns (uint256)",
        "function delegates(address) view returns (address)",
        "function totalSupply() view returns (uint256)"
    ];

    const token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);

    console.log("=".repeat(50));
    console.log("CONTRACT CHECK");
    console.log("=".repeat(50));
    console.log("Token Address:", TOKEN_ADDRESS);
    console.log("User Address:", TEST_ADDRESS);
    console.log("");

    const name = await token.name();
    console.log("Token Name:", name);

    const symbol = await token.symbol();
    console.log("Token Symbol:", symbol);

    const balance = await token.balanceOf(TEST_ADDRESS);
    console.log("");
    console.log(">>> BALANCE:", ethers.formatEther(balance), "BLSTR");

    const votes = await token.getVotes(TEST_ADDRESS);
    console.log(">>> VOTING POWER:", ethers.formatEther(votes), "BLSTR");

    const delegate = await token.delegates(TEST_ADDRESS);
    console.log(">>> DELEGATE:", delegate);

    const totalSupply = await token.totalSupply();
    console.log("");
    console.log("Total Supply:", ethers.formatEther(totalSupply), "BLSTR");
    console.log("=".repeat(50));
}

main();
