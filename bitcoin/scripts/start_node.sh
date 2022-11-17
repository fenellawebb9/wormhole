#!/bin/bash -f

# 18554  --wallet
# 18555  --btc server
# 18556  --RPC server

set -x

mkdir -p /root/.btcd
touch /root/.btcd/btcd.conf

/go/bin/btcd --addrindex --simnet --rpcuser=wormhole --rpcpass=w0rmh013 --miningaddr=ShadQfLbaRSnU5c1XrLknkLyWCkVV8rGMy  --rpclisten 0.0.0.0:18556 &
sleep 1
/go/bin/btcwallet --simnet --username wormhole --password=w0rmh013  --rpclisten 0.0.0.0:18554 &
sleep 1
/go/bin/btcctl --simnet --wallet --rpcuser=wormhole --rpcpass=w0rmh013 walletpassphrase foo 9999
/go/bin/btcctl --simnet --wallet --rpcuser=wormhole --rpcpass=w0rmh013 importprivkey Frd9p1JbyHgmcRrEzixN4LAAhK7forzdw65A9j6CTXRGiwawqKkg
# 300 blocks are required for segwit to activate as well as the initial minting of 50 BTC to mature
/go/bin/btcctl --simnet --rpcuser=wormhole --rpcpass=w0rmh013   generate 150
sleep 5
# This seems to get the wallets brain working correctly so that all the btc are in the default account
/go/bin/btcctl --simnet --wallet --rpcuser=wormhole --rpcpass=w0rmh013 getnewaddress "default"
/go/bin/btcctl --simnet --wallet --rpcuser=wormhole --rpcpass=w0rmh013 getnewaddress "default"
jobs
#sleep infinity
nc -lk 0.0.0.0 18557
