# ♻️ eco eeelien — Recicla y Gana en Monad

**eco eeelien** es una dapp de reciclaje sobre Monad Testnet donde los usuarios reciben tokens **ECO** por cada botella de plástico o lata de aluminio que registren. Un ESP32-CAM actúa como el contenedor inteligente que detecta y registra la botella on-chain.

---

## 🏗️ Arquitectura

```
ESP32-CAM (físico)
      │
      │  HTTP POST → registerBottle(user, bottleType)
      ▼
RecyclingRegistry.sol  ──mintReward()──▶  EcoToken.sol
      │
      │  evento BottleRegistered
      ▼
Frontend (Next.js)  ──wagmi/viem──▶  Monad Testnet
```

### Flujo
1. Usuario se registra con su wallet en la app
2. Lleva su botella al contenedor (ESP32-CAM)
3. La cámara detecta el tipo de botella y llama `registerBottle(userAddress, bottleType)`
4. El contrato mintea ECO tokens directamente a la wallet del usuario
5. El usuario ve sus recompensas en tiempo real en la app

---

## 📦 Contratos Desplegados — Monad Testnet (Chain 10143)

| Contrato | Dirección |
|----------|-----------|
| **EcoToken (ECO)** | `0xC365564E5AbA75dC747DF82027ED0C9AeA39B6a9` |
| **RecyclingRegistry** | `0x7fFCcdD4b9Ae0a3cfCdA86c954AE8a1816Ec74C3` |

🔎 Explorer:
- [EcoToken en Socialscan](https://monad-testnet.socialscan.io/address/0xC365564E5AbA75dC747DF82027ED0C9AeA39B6a9)
- [RecyclingRegistry en Socialscan](https://monad-testnet.socialscan.io/address/0x7fFCcdD4b9Ae0a3cfCdA86c954AE8a1816Ec74C3)

---

## 💰 Recompensas

| Tipo | Tokens ECO |
|------|-----------|
| 🥤 Botella de plástico | 5 ECO |
| 🥫 Lata de aluminio | 10 ECO |

---

## 🚀 Setup

### Contratos (Foundry)
```bash
cd contracts
forge build
forge test
```

### Deploy
```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🎥 Demo Video — ESP32-CAM

Para el demo, el ESP32-CAM simula el proceso:
1. Detecta botella con la cámara
2. Clasifica: plástico (azul) o aluminio (rojo)
3. Hace POST al backend/contrato → registra on-chain
4. LEDs confirman el registro y muestra tokens ganados

Scripts de demo: ver `scripts/demo-register.sh`

---

## 🔧 Monad Testnet Config

```
Chain ID: 10143
RPC: https://testnet-rpc.monad.xyz
Faucet: https://faucet.monad.xyz
```

---

## 📁 Estructura del Repo

```
eco-eeelien-monad/
├── contracts/          # Foundry — Solidity
│   ├── src/
│   │   ├── EcoToken.sol
│   │   └── RecyclingRegistry.sol
│   └── script/
│       └── Deploy.s.sol
├── frontend/           # Next.js + wagmi/viem (WIP)
├── esp32/              # Firmware ESP32-CAM (WIP)
└── scripts/            # Scripts de demo
```

---

## Team
- **eeelien** — Monad Blitz CDMX 2025
