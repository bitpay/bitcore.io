# Running a Wallet Service

The purpose of this tutorial is to show how to setup the Wallet Service. The Wallet Service is the backend for wallets such as BitPay's Copay Mutisignature wallet. The wallet service is very much like the backend for traditional SPV (Simplified Payment Verification) wallets except that the wallet service is much more feature-full.

## Installing Dependencies

MongoDB is the main dependency that you will need to install outside of node modules.

### Installing MongoDB on Mac OS X

The easiest way to install MongoDB on a Mac is to use brew. Please refer to these [complete instructions](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/):

```bash
$ brew install update
$ brew install mongodb
$ mkdir -p /data/db
$ sudo chown -R `whoami` /data/db #this assumes that the next step will be run by the current user
$ mongod
```

### Installing MongoDB on Linux (Debian-based)

```bash
$ sudo apt-get install mongodb
```

This usually starts mongod for you after installation, but if it doesn't:

```bash
$ mongod
```

## Add the Wallet Service to Our Node

We begin this process already having a node set up and synced with the Bitcoin Blockchain. To perform the initial setup of your node, please see: [How to run a full node](fullnode.md)

```bash
$ cd <your node>
$ bitcore-node add bitcore-wallet-service
$ bitcore-node add insight-api
```

Now we should be ready to launch Bitcore-node and test the Wallet Service

```bash
$ bitcore-node start
```

## Test the Wallet Service using Copay

The wallet service should be running as a service within bitcore-node. You may point wallets on the same network to:

http://your-bitcore-node-ip:3232/bws/api

![Copay Screenshot](https://i.imgur.com/2hsGXrx.png)

### Example

Once the wallet service is running on my computer that has an ip address of 10.10.10.10, then I would configure my Copay wallet as such:

* Open the settings on my Copay wallet. Scroll to "Bitcore Wallet Service" and change this value to: http://10.10.10.10:3232/bws/api
* Please ensure that Copay is on the same network or that you have opened ports in order to let Copay access your new Wallet Service
* TLS/SSL support can be enabled by [adding a few things to the bitcore-node.json config](#adding-ssltls-support)

## Test the Wallet Service using the Bitcore Wallet Client

Install the wallet client

```bash
$ sudo npm install -g bitcore-wallet
```

Create a new wallet on your server:
```bash
$ wallet-create -h http://your-bitcore-node-ip:3232/bws/api --testnet 'myWallet' 1-1
[info] Generating new keys
* Testnet Wallet Created.
* Saving file /Users/myUsername/.wallet.dat
```
Add a new address:
```bash
$ wallet -h http://your-bitcore-node-ip:3232/bws/api address
* New Address mjfmEtkaVbZPGPLBYvznPDer2dDdcruirB
```

Then send funds to this address from a faucet or other wallet, after you have funds you can see them by checking your
wallet status.

```bash
$ wallet -h http://your-bitcore-node-ip:3232/bws/api status
* Wallet myWallet [testnet]: 1-of-1 complete
* Copayers: myUsername
* Balance 1,000 bit (Locked: 0 bit)

```

**Pro-tip:** If you would rather not enter the host address of your wallet server every time you run a command, try
[aliasing](https://wiki.manjaro.org/index.php?title=Aliases_in_.bashrc) it in your bash profile by adding a line like
this to your .bashrc file:
```
alias mywallet='wallet -h http://your-bitcore-node-ip:3232/bws/api'
```

You can then send your bits by using your new alias:
```bash
$ mywallet send mxo2iZ9e1c4piKMZGyeujk2MwgBU31W7cw 100bit
* Tx created: ID 36f4 [pending] RequiredSignatures: 1
$ mywallet sign 36f4
Transaction signed by you.
$ mywallet broadcast 36f4
Transaction Broadcasted: TXID: fa7b45b63562c265c3a79904f1ec9c547bad5dee1508ce63628047a9097bfd0e
$ mywallet balance
* Wallet balance 900 bit (Locked 0 bit)
```

## Adding SSL/TLS Support

Edit your config.

```bash
$ nano bitcore-node.json
```

Added https options. Example:

```json
{
  "datadir": "/home/user/.bitcoin",
  "network": "livenet",
  "port": 3001,
  "https": true,
  "httpsOptions": {
    "key": "/home/user/keyfile.pem",
    "cert": "/home/user/certfile.crt"
  },
  "services": [
    "address",
    "bitcoind",
    "bitcore-wallet-service",
    "db",
    "insight-api",
    "web"
  ]
}
```

## Conclusion

You should now be able to run your own Wallet Service for your users. Doing so will give you ultimate control over your wallets without trusting random SPV nodes on the Internet.
