// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title EcoToken — Token de recompensa para reciclaje en eco eeelien
/// @notice Los usuarios reciben ECO tokens al registrar botellas y completar retos
contract EcoToken is ERC20, Ownable {
    /// @notice Contratos autorizados a mintear ECO tokens (Registry, ChallengeManager)
    mapping(address => bool) public minters;

    event MinterUpdated(address indexed minter, bool authorized);

    modifier onlyMinter() {
        require(minters[msg.sender], "EcoToken: caller is not authorized minter");
        _;
    }

    constructor(address initialOwner) ERC20("EcoToken", "ECO") Ownable(initialOwner) {}

    /// @notice Autoriza o revoca un contrato minter
    function setMinter(address minter, bool authorized) external onlyOwner {
        minters[minter] = authorized;
        emit MinterUpdated(minter, authorized);
    }

    /// @notice Mintea tokens de recompensa para el usuario
    function mintReward(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
    }

    // Compatibilidad con VoucherNFT (burn para canjear cupones)
    function transferFrom(address from, address to, uint256 amount)
        public override returns (bool)
    {
        return super.transferFrom(from, to, amount);
    }
}
