const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🔍 Verifying contracts on BaseScan...\n");

    const deployment = require("../deployments/baseSepolia.json");

    const tokenAddress = deployment.contracts.BaseLobsterToken;
    const governorAddress = deployment.contracts.BaseLobsterGovernor;
    const treasuryAddress = deployment.contracts.BaseLobsterTreasury;

    const deployer = deployment.deployer;

    // Constructor arguments
    const tokenArgs = [treasuryAddress, deployer, deployer];
    const governorArgs = [tokenAddress, treasuryAddress];
    const treasuryArgs = [86400, [], ["0x0000000000000000000000000000000000000000"], deployer];

    console.log("1. Verifying BaseLobsterToken...");
    console.log("   Address:", tokenAddress);
    console.log("   Args:", tokenArgs);

    try {
        await hre.run("verify:verify", {
            address: tokenAddress,
            constructorArguments: tokenArgs,
            contract: "contracts/BaseLobsterToken.sol:BaseLobsterToken",
        });
        console.log("   ✅ Token verified!\n");
    } catch (e) {
        if (e.message.includes("Already Verified")) {
            console.log("   ✅ Already verified!\n");
        } else {
            console.log("   ❌ Error:", e.message, "\n");
        }
    }

    console.log("2. Verifying BaseLobsterGovernor...");
    console.log("   Address:", governorAddress);
    console.log("   Args:", governorArgs);

    try {
        await hre.run("verify:verify", {
            address: governorAddress,
            constructorArguments: governorArgs,
            contract: "contracts/BaseLobsterGovernor.sol:BaseLobsterGovernor",
        });
        console.log("   ✅ Governor verified!\n");
    } catch (e) {
        if (e.message.includes("Already Verified")) {
            console.log("   ✅ Already verified!\n");
        } else {
            console.log("   ❌ Error:", e.message, "\n");
        }
    }

    console.log("3. Verifying BaseLobsterTreasury...");
    console.log("   Address:", treasuryAddress);
    console.log("   Args:", treasuryArgs);

    try {
        await hre.run("verify:verify", {
            address: treasuryAddress,
            constructorArguments: treasuryArgs,
            contract: "contracts/BaseLobsterTreasury.sol:BaseLobsterTreasury",
        });
        console.log("   ✅ Treasury verified!\n");
    } catch (e) {
        if (e.message.includes("Already Verified")) {
            console.log("   ✅ Already verified!\n");
        } else {
            console.log("   ❌ Error:", e.message, "\n");
        }
    }

    console.log("✅ Verification complete!");
}

main().catch(console.error);
