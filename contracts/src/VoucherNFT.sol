// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./EcoToken.sol";

/// @title VoucherNFT — Cupones de descuento con empresas aliadas
/// @notice El usuario quema ECO tokens para obtener un NFT-cupón real
/// @dev Cada empresa aliada define su propio tipo de voucher con precio y descripción
contract VoucherNFT is ERC721, Ownable {
    EcoToken public ecoToken;
    uint256 private _tokenIdCounter;

    struct VoucherType {
        string partnerName;   // Ej: "Starbucks CDMX"
        string description;   // Ej: "30% en tu próxima bebida"
        string imageURI;      // Logo/imagen del cupón
        uint256 ecoCost;      // Cuántos ECO tokens cuesta
        bool active;          // Si se puede canjear
        uint256 totalRedeemed;// Total canjeados (para stats)
    }

    struct VoucherInfo {
        uint256 typeId;
        address redeemedBy;
        uint256 redeemedAt;
        bool used;            // El negocio marca como usado
        bytes32 code;         // Código único verificable
    }

    mapping(uint256 => VoucherType) public voucherTypes;
    mapping(uint256 => VoucherInfo) public voucherInfo; // tokenId → info
    mapping(address => bool) public validators;          // Negocios autorizados a marcar como usado
    uint256 public voucherTypeCount;

    event VoucherRedeemed(
        address indexed user,
        uint256 indexed tokenId,
        uint256 indexed typeId,
        uint256 ecoBurned
    );
    event VoucherUsed(uint256 indexed tokenId, address indexed validator);
    event VoucherTypeAdded(uint256 indexed typeId, string partnerName, uint256 ecoCost);

    constructor(address initialOwner, address _ecoToken)
        ERC721("EcoVoucher", "ECOV")
        Ownable(initialOwner)
    {
        ecoToken = EcoToken(_ecoToken);
    }

    /// @notice El owner agrega un tipo de voucher de empresa aliada
    function addVoucherType(
        string calldata partnerName,
        string calldata description,
        string calldata imageURI,
        uint256 ecoCost
    ) external onlyOwner returns (uint256 typeId) {
        typeId = voucherTypeCount++;
        voucherTypes[typeId] = VoucherType({
            partnerName: partnerName,
            description: description,
            imageURI: imageURI,
            ecoCost: ecoCost,
            active: true,
            totalRedeemed: 0
        });
        emit VoucherTypeAdded(typeId, partnerName, ecoCost);
    }

    /// @notice El usuario quema ECO tokens y recibe un NFT-cupón
    function redeemVoucher(uint256 typeId) external returns (uint256 tokenId) {
        VoucherType storage vtype = voucherTypes[typeId];
        require(vtype.active, "VoucherNFT: voucher type not active");
        require(
            ecoToken.balanceOf(msg.sender) >= vtype.ecoCost,
            "VoucherNFT: insufficient ECO tokens"
        );

        // Quemar ECO tokens del usuario
        // EcoToken necesita allowance — el usuario aprueba primero en el frontend
        bool transferred = ecoToken.transferFrom(msg.sender, address(0x000000000000000000000000000000000000dEaD), vtype.ecoCost);
        require(transferred, "VoucherNFT: burn failed");

        // Mintear el NFT-cupón
        tokenId = _tokenIdCounter++;
        _safeMint(msg.sender, tokenId);

        // Registrar info del cupón con código único
        bytes32 uniqueCode = keccak256(abi.encodePacked(msg.sender, tokenId, block.timestamp, block.prevrandao));
        voucherInfo[tokenId] = VoucherInfo({
            typeId: typeId,
            redeemedBy: msg.sender,
            redeemedAt: block.timestamp,
            used: false,
            code: uniqueCode
        });

        vtype.totalRedeemed++;
        emit VoucherRedeemed(msg.sender, tokenId, typeId, vtype.ecoCost);
    }

    /// @notice El negocio aliado marca el cupón como usado (previene reuso)
    function markAsUsed(uint256 tokenId) external {
        require(validators[msg.sender] || msg.sender == owner(), "VoucherNFT: not a validator");
        require(!voucherInfo[tokenId].used, "VoucherNFT: already used");
        voucherInfo[tokenId].used = true;
        emit VoucherUsed(tokenId, msg.sender);
    }

    /// @notice Agrega un validador (negocio aliado)
    function setValidator(address validator, bool authorized) external onlyOwner {
        validators[validator] = authorized;
    }

    /// @notice Activa/desactiva un tipo de voucher
    function setVoucherTypeActive(uint256 typeId, bool active) external onlyOwner {
        voucherTypes[typeId].active = active;
    }

    /// @notice Verifica si un cupón es válido (para el negocio)
    function isValidVoucher(uint256 tokenId) external view returns (
        bool valid,
        string memory partnerName,
        string memory description,
        address owner_,
        bool used
    ) {
        VoucherInfo memory info = voucherInfo[tokenId];
        VoucherType memory vtype = voucherTypes[info.typeId];
        return (
            !info.used && _ownerOf(tokenId) != address(0),
            vtype.partnerName,
            vtype.description,
            _ownerOf(tokenId),
            info.used
        );
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        VoucherInfo memory info = voucherInfo[tokenId];
        VoucherType memory vtype = voucherTypes[info.typeId];
        // En producción: metadata JSON on-chain o IPFS
        return vtype.imageURI;
    }
}
