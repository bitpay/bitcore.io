<a name="PublicKeyHashInput"></a>
#class: PublicKeyHashInput
**Members**

* [class: PublicKeyHashInput](#PublicKeyHashInput)
  * [new PublicKeyHashInput()](#new_PublicKeyHashInput)
  * [publicKeyHashInput.getSignatures(transaction, privateKey, index, [sigtype], [hashData])](#PublicKeyHashInput#getSignatures)
  * [publicKeyHashInput.addSignature(signature)](#PublicKeyHashInput#addSignature)
  * [publicKeyHashInput.clearSignatures()](#PublicKeyHashInput#clearSignatures)
  * [publicKeyHashInput.isFullySigned()](#PublicKeyHashInput#isFullySigned)

<a name="new_PublicKeyHashInput"></a>
##new PublicKeyHashInput()
Represents a special kind of input of PayToPublicKeyHash kind.

<a name="PublicKeyHashInput#getSignatures"></a>
##publicKeyHashInput.getSignatures(transaction, privateKey, index, [sigtype], [hashData])
**Params**

- transaction `Transaction` - the transaction to be signed  
- privateKey `PrivateKey` - the private key with which to sign the transaction  
- index `number` - the index of the input in the transaction input vector  
- \[sigtype\] `number` - the type of signature, defaults to Signature.SIGHASH_ALL  
- \[hashData\] `Buffer` - the precalculated hash of the public key associated with the privateKey provided  

**Returns**: `Array` - of objects that can be  
<a name="PublicKeyHashInput#addSignature"></a>
##publicKeyHashInput.addSignature(signature)
Add the provided signature

**Params**

- signature `Object`  
  - publicKey `PublicKey`  
  - signature `Signature`  
  - \[sigtype\] `number`  

**Returns**: [PublicKeyHashInput](#PublicKeyHashInput) - this, for chaining  
<a name="PublicKeyHashInput#clearSignatures"></a>
##publicKeyHashInput.clearSignatures()
Clear the input's signature

**Returns**: [PublicKeyHashInput](#PublicKeyHashInput) - this, for chaining  
<a name="PublicKeyHashInput#isFullySigned"></a>
##publicKeyHashInput.isFullySigned()
Query whether the input is signed

**Returns**: `boolean`  
