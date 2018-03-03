
const exec = require('child_process').exec

const ip = process.argv[2]

exec(`iptables -A INPUT -s ${ip} -j DROP`)
