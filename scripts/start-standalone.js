process.env.PORT = process.env.PORT || '8000';
process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

require('../.next/standalone/server.js');
