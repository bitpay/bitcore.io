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

## Test the Wallet Service

The wallet service should be running as a service within bitcore-node. You may point wallets on the same network to:

http://your-bitcore-node-ip:3232/bws/api

### Example

Once the wallet service is running on my computer that has an ip address of 10.10.10.10, then I would configure my Copay wallet as such:

* Open the settings on my Copay wallet. Scroll to "Bitcore Wallet Service" and change this value to: http://10.10.10.10:3232/bws/api
* Please ensure that Copay is on the same network or that you have opened ports in order to let Copay access your new Wallet Service
* TLS/SSL support can be enabled by adding a few things to the bitcore-node.json config

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
