#!/bin/bash
# eco eeelien — Demo: Registrar botella directamente con cast
# Simula lo que haría el ESP32-CAM

PRIVATE_KEY=0xbf1f0efa9a7517f8e31ab6eaf1eece0cb90196daf160553d8493d75e6e989b4f
REGISTRY=0x7fFCcdD4b9Ae0a3cfCdA86c954AE8a1816Ec74C3
ECO_TOKEN=0xC365564E5AbA75dC747DF82027ED0C9AeA39B6a9
RPC=https://testnet-rpc.monad.xyz

USER_ADDRESS=${1:-0x381AF5bDC1BCBA9a24Af7feba5390D99C7cf080f}
BOTTLE_TYPE=${2:-0}  # 0 = Plastic, 1 = Aluminum

echo "♻️  eco eeelien — Demo de reciclaje"
echo "======================================"
echo "Usuario:  $USER_ADDRESS"
echo "Botella:  $([ $BOTTLE_TYPE -eq 0 ] && echo '🥤 Plástico (5 ECO)' || echo '🥫 Aluminio (10 ECO)')"
echo ""

# Verificar balance antes
echo "📊 Balance ECO antes del registro:"
cast call $ECO_TOKEN "balanceOf(address)(uint256)" $USER_ADDRESS --rpc-url $RPC | xargs -I{} cast to-unit {} ether

echo ""
echo "🔄 Registrando botella on-chain..."

# Llamar registerBottle(address user, uint8 bottleType)
TX=$(cast send $REGISTRY \
  "registerBottle(address,uint8)" $USER_ADDRESS $BOTTLE_TYPE \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC \
  --json | jq -r '.transactionHash')

echo "✅ Tx: $TX"
echo "🔎 Explorer: https://monad-testnet.socialscan.io/tx/$TX"
echo ""

sleep 2

# Verificar balance después
echo "💰 Balance ECO después:"
cast call $ECO_TOKEN "balanceOf(address)(uint256)" $USER_ADDRESS --rpc-url $RPC | xargs -I{} cast to-unit {} ether
echo "ECO tokens"
