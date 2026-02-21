// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/EcoToken.sol";
import "../src/RecyclingRegistry.sol";
import "../src/ChallengeManager.sol";
import "../src/VoucherNFT.sol";

// Deploy solo ChallengeManager + VoucherNFT (EcoToken y Registry ya existen)
contract DeployScript is Script {
    address constant ECO_TOKEN  = 0x03b5e6F27E1b1A1ae5aA990074209FcFaE473222;
    address constant REGISTRY   = 0x18590Db5176e85785fb859b4b96E99b0A4D2f817;

    function run() external {
        vm.startBroadcast();

        EcoToken ecoToken    = EcoToken(ECO_TOKEN);
        RecyclingRegistry registry = RecyclingRegistry(REGISTRY);

        // 1. Deploy ChallengeManager
        ChallengeManager challenges = new ChallengeManager(msg.sender, ECO_TOKEN, REGISTRY);
        console.log("ChallengeManager:", address(challenges));

        // 2. Deploy VoucherNFT
        VoucherNFT vouchers = new VoucherNFT(msg.sender, ECO_TOKEN);
        console.log("VoucherNFT:      ", address(vouchers));

        // 3. Autorizar ChallengeManager como minter
        ecoToken.setMinter(address(challenges), true);
        console.log("ChallengeManager autorizado como minter");

        vm.stopBroadcast();
        console.log("--- Deploy fase 2 completo ---");
    }
}

// Agrega retos (tx separada para evitar gas limit)
contract AddChallengesScript is Script {
    function run() external {
        address challenges = vm.envAddress("CHALLENGE_MANAGER");
        ChallengeManager cm = ChallengeManager(challenges);

        vm.startBroadcast();

        cm.addChallenge("Primera Botella", "Registra tu primera botella", unicode"🌱",
            ChallengeManager.ChallengeType.TotalBottles, 1, 10 * 10**18);

        cm.addChallenge("Eco Beginner", "Recicla 5 botellas en total", unicode"🥤",
            ChallengeManager.ChallengeType.TotalBottles, 5, 25 * 10**18);

        cm.addChallenge("Semana Verde", "10 botellas en una semana", unicode"🌿",
            ChallengeManager.ChallengeType.WeeklyBottles, 10, 50 * 10**18);

        cm.addChallenge("Aluminio Pro", "Recicla 5 latas", unicode"🥫",
            ChallengeManager.ChallengeType.AluminumBottles, 5, 30 * 10**18);

        cm.addChallenge("Eco Warrior", "Recicla 25 botellas", unicode"🌍",
            ChallengeManager.ChallengeType.TotalBottles, 25, 100 * 10**18);

        cm.addChallenge("Guardian Verde", "Recicla 50 botellas", unicode"♻️",
            ChallengeManager.ChallengeType.TotalBottles, 50, 250 * 10**18);

        vm.stopBroadcast();
        console.log("6 retos agregados");
    }
}

// Agrega vouchers de empresas aliadas
contract AddVouchersScript is Script {
    function run() external {
        address vouchers = vm.envAddress("VOUCHER_NFT");
        VoucherNFT vn = VoucherNFT(vouchers);

        vm.startBroadcast();

        vn.addVoucherType("Starbucks CDMX", "30% en tu bebida favorita",
            "ipfs://eco-eeelien/starbucks", 50 * 10**18);

        vn.addVoucherType("Spotify Premium", "1 mes gratis de Spotify",
            "ipfs://eco-eeelien/spotify", 100 * 10**18);

        vn.addVoucherType("Eco Tienda", "20% en productos sustentables",
            "ipfs://eco-eeelien/ecotienda", 30 * 10**18);

        vm.stopBroadcast();
        console.log("3 vouchers de empresas aliadas agregados");
    }
}
