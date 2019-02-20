import shim = require('fabric-shim');
import PHRChaincode from './PHRChaincode';

shim.start(new PHRChaincode());
