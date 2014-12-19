<a name="Interpreter"></a>
#Interpreter()
Bitcoin transactions contain scripts. Each input has a script called the
scriptSig, and each output has a script called the scriptPubkey. To validate
an input, the input's script is concatenated with the referenced output script,
and the result is executed. If at the end of execution the stack contains a
"true" value, then the transaction is valid.

The primary way to use this class is via the verify function.
e.g., Interpreter().verify( ... );

