// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./EcoToken.sol";
import "./RecyclingRegistry.sol";

/// @title ChallengeManager — Retos de reciclaje con recompensas extra
/// @notice Los usuarios completan retos y reciben ECO tokens de bonus
contract ChallengeManager is Ownable {
    EcoToken public ecoToken;
    RecyclingRegistry public registry;

    enum ChallengeType {
        TotalBottles,     // Total de botellas (lifetime)
        WeeklyBottles,    // Botellas en la semana actual
        AluminumBottles,  // Solo latas de aluminio
        PlasticBottles    // Solo botellas de plástico
    }

    struct Challenge {
        string name;
        string description;
        string badge;          // Emoji del badge
        ChallengeType ctype;
        uint256 target;        // Meta de botellas
        uint256 bonusReward;   // ECO tokens de bonus
        bool active;
    }

    mapping(uint256 => Challenge) public challenges;
    uint256 public challengeCount;

    // user → challengeId → completado
    mapping(address => mapping(uint256 => bool)) public completed;

    // Tracking semanal: user → semana → botellas
    mapping(address => mapping(uint256 => uint256)) public weeklyCount;
    // Tracking por tipo: user → bottleType → count
    mapping(address => mapping(uint8 => uint256)) public typeCount;

    event ChallengeCompleted(
        address indexed user,
        uint256 indexed challengeId,
        string badge,
        uint256 bonusReward
    );

    constructor(address initialOwner, address _ecoToken, address _registry)
        Ownable(initialOwner)
    {
        ecoToken = EcoToken(_ecoToken);
        registry = RecyclingRegistry(_registry);
        // Retos se agregan via addChallenge() después del deploy
    }

    /// @notice Se llama después de registrar una botella (por el Registry o el usuario)
    /// @dev Actualiza contadores y revisa si se completan retos
    function trackAndClaim(address user, uint8 bottleType) external {
        // Solo el registry o el propio usuario puede llamar esto
        require(
            msg.sender == address(registry) || msg.sender == user,
            "ChallengeManager: unauthorized"
        );

        // Actualizar conteo semanal
        uint256 currentWeek = block.timestamp / 7 days;
        weeklyCount[user][currentWeek]++;

        // Actualizar conteo por tipo
        typeCount[user][bottleType]++;

        // Revisar todos los retos activos
        _checkChallenges(user);
    }

    /// @notice El usuario reclama sus retos completados manualmente
    function claimChallenges() external {
        _checkChallenges(msg.sender);
    }

    function _checkChallenges(address user) internal {
        (uint256 totalBottles, ) = registry.getUserStats(user);
        uint256 currentWeek = block.timestamp / 7 days;

        for (uint256 i = 0; i < challengeCount; i++) {
            if (!challenges[i].active || completed[user][i]) continue;

            Challenge memory c = challenges[i];
            bool isCompleted = false;

            if (c.ctype == ChallengeType.TotalBottles) {
                isCompleted = totalBottles >= c.target;
            } else if (c.ctype == ChallengeType.WeeklyBottles) {
                isCompleted = weeklyCount[user][currentWeek] >= c.target;
            } else if (c.ctype == ChallengeType.AluminumBottles) {
                isCompleted = typeCount[user][1] >= c.target; // 1 = Aluminum
            } else if (c.ctype == ChallengeType.PlasticBottles) {
                isCompleted = typeCount[user][0] >= c.target; // 0 = Plastic
            }

            if (isCompleted) {
                completed[user][i] = true;
                ecoToken.mintReward(user, c.bonusReward);
                emit ChallengeCompleted(user, i, c.badge, c.bonusReward);
            }
        }
    }

    /// @notice Todos los retos y si el usuario los completó
    function getUserChallenges(address user) external view returns (
        Challenge[] memory allChallenges,
        bool[] memory completedStatus,
        uint256[] memory progress
    ) {
        allChallenges = new Challenge[](challengeCount);
        completedStatus = new bool[](challengeCount);
        progress = new uint256[](challengeCount);

        (uint256 totalBottles, ) = registry.getUserStats(user);
        uint256 currentWeek = block.timestamp / 7 days;

        for (uint256 i = 0; i < challengeCount; i++) {
            allChallenges[i] = challenges[i];
            completedStatus[i] = completed[user][i];

            if (challenges[i].ctype == ChallengeType.TotalBottles) {
                progress[i] = totalBottles;
            } else if (challenges[i].ctype == ChallengeType.WeeklyBottles) {
                progress[i] = weeklyCount[user][currentWeek];
            } else if (challenges[i].ctype == ChallengeType.AluminumBottles) {
                progress[i] = typeCount[user][1];
            } else if (challenges[i].ctype == ChallengeType.PlasticBottles) {
                progress[i] = typeCount[user][0];
            }
        }
    }

    function _addChallenge(
        string memory name,
        string memory description,
        string memory badge,
        ChallengeType ctype,
        uint256 target,
        uint256 bonusReward
    ) internal {
        challenges[challengeCount++] = Challenge({
            name: name,
            description: description,
            badge: badge,
            ctype: ctype,
            target: target,
            bonusReward: bonusReward,
            active: true
        });
    }

    function addChallenge(
        string calldata name,
        string calldata description,
        string calldata badge,
        ChallengeType ctype,
        uint256 target,
        uint256 bonusReward
    ) external onlyOwner {
        _addChallenge(name, description, badge, ctype, target, bonusReward);
    }
}
