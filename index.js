
const fs = require('fs')
const config = require('./config.js')
const exec = require('child_process').exec

const TYPES = {
	ssh: {
		fail: 'Failed password',
		success: 'Accepted password',
		user: /invalid user (.*) from/
	}
}
const IPV4_REGEX = /((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/
const TABLE = {}

function parseCronEntry (date) {
	const minutes = date.getMinutes()
	const hours = date.getHours()
	const day = date.getDate()
	const month = date.getMonth() + 1
	
	return `${minutes} ${hours} ${day} ${month} * node  ${__dirname}/clear.js 192.159.23.2`

}

function createCronJob () {

}

function textToTime (text) {
	if (!text) {
		console.log('inf')
	}

	const today = new Date();

	console.log(today.toLocaleString())

	if (text.match(/[0-9]*[mM]/)) {
		let minutes = today.getMinutes()
		minutes +=	parseInt(text.split(/[mM]/)[0])
		today.setMinutes(minutes)
		console.log(today)
		exec(parseCronEntry(today))
	} else if (text.match(/[0-9]*[hH]/)) {
		console.log(text, 'hour')
	} else if (text.match(/[0-9]*[dD]/)) {
		console.log(text, 'day')
	}
} 

textToTime('2m')

//exec('node ./clear.js 192.159.23.2')

fs.watch('/var/log/secure', function (event) {
	const file = fs.readFileSync('/var/log/secure')
	const logs = file.toString('utf8').split('\n')
	const lastLine = logs[logs.length - 1] || logs[logs.length - 2]
	
	config.map(function (conf) {
		const type = TYPES[conf.type];
		const user = lastLine.match(type.user)[1]
		const ip = lastLine.match(IPV4_REGEX)[0]	
		
		if (lastLine.includes(type.fail)) {
			if (TABLE[ip] === undefined) {
				TABLE[ip] = 1
			} else {
				TABLE[ip]++
	
				if (TABLE[ip] == conf.threshold) {
					console.log('bye motherfcker')
					exec(`iptables -A INPUT -s ${ip} -j DROP`)
				}

			}
		} else if (lastLine.includes(type.success)) {
			if (TABLE[ip]) {
				delete TABLE[ip]	
			}
		}
	
	})
	
	console.log(TABLE)
	
})
