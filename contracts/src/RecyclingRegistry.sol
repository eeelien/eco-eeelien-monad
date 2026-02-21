// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./EcoToken.sol";

/// @title RecyclingRegistry — Registro de botellas recicladas en eco eeelien
/// @notice El ESP32-CAM actúa como operador autorizado y registra botellas.
///         Cada registro mintea ECO tokens para el usuario reciclador.
contract RecyclingRegistry is Ownable {
    EcoToken public ecoToken;

    /// @notice Tipos de botella soportados
    enum BottleType {
        Plastic,   // botella de plástico
        Aluminum   // lata de aluminio
    }

    /// @notice Recompensas por tipo de botella (en wei, 18 decimales)
    uint256 public plasticReward  = 5 * 10**18;  // 5 ECO por botella de plástico
    uint256 public aluminumReward = 10 * 10**18; // 10 ECO por lata de aluminio

    /// @notice Operadores autorizados (los ESP32-CAM / contenedores físicos)
    mapping(address => bool) public operators;

    /// @notice Total de botellas recicladas por usuario
    mapping(address => uint256) public totalRecycled;

    /// @notice Total de tokens ganados por usuario
    mapping(address => uint256) public totalEarned;

    /// @notice Contador global de botellas recicladas
    uint256 public globalTotalRecycled;

    /// @notice Evento emitido al registrar una botella
    event BottleRegistered(
        address indexed user,
        address indexed operator,
        BottleType bottleType,
        uint256 reward,
        uint256 timestamp
    );

    event OperatorUpdated(address indexed operator, bool authorized);
    event RewardsUpdated(uint256 plasticReward, uint256 aluminumReward);

    modifier onlyOperator() {
        require(operators[msg.sender], "RecyclingRegistry: caller is not an operator");
        _;
    }

    constructor(address initialOwner, address _ecoToken) Ownable(initialOwner) {
        ecoToken = EcoToken(_ecoToken);
    }

    /// @notice Autoriza o revoca un operador (ESP32-CAM / admin)
    function setOperator(address operator, bool authorized) external onlyOwner {
        operators[operator] = authorized;
        emit OperatorUpdated(operator, authorized);
    }

    /// @notice Permite al owner también registrar botellas directamente
    function setOwnerAsOperator() external onlyOwner {
        operators[msg.sender] = true;
        emit OperatorUpdated(msg.sender, true);
    }

    /// @notice Actualiza las recompensas por tipo de botella
    function setRewards(uint256 _plasticReward, uint256 _aluminumReward) external onlyOwner {
        plasticReward  = _plasticReward;
        aluminumReward = _aluminumReward;
        emit RewardsUpdated(_plasticReward, _aluminumReward);
    }

    /// @notice Registra una botella reciclada y mintea la recompensa al usuario
    /// @param user     Dirección del usuario que reciclará la recompensa
    /// @param bottleType Tipo de botella (0 = Plastic, 1 = Aluminum)
    function registerBottle(address user, BottleType bottleType) external onlyOperator {
        require(user != address(0), "RecyclingRegistry: invalid user address");

        uint256 reward = bottleType == BottleType.Aluminum ? aluminumReward : plasticReward;

        totalRecycled[user]++;
        totalEarned[user] += reward;
        globalTotalRecycled++;

        ecoToken.mintReward(user, reward);

        emit BottleRegistered(user, msg.sender, bottleType, reward, block.timestamp);
    }

    /// @notice Consulta el resumen de reciclaje de un usuario
    function getUserStats(address user) external view returns (
        uint256 bottlesRecycled,
        uint256 tokensEarned
    ) {
        return (totalRecycled[user], totalEarned[user]);
    }
}
