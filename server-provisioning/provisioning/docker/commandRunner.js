const Client = require('ssh2').Client;


module.exports = function (infrastructure, command) {
    const conn = new Client();
console.log('starting initial connection to ' + infrastructure);
    return new Promise((resolve, reject) => {
        conn.on('ready', function () {
            console.log('ready to run ' + command);
            conn.exec(command, function (err, stream) {
                console.log('exec command');
                if (err) throw err;
                stream.on('close', function (code, signal) {
                    resolve(code);
                    conn.end();
                }).on('data', function (data) {
                    console.log('STDOUT: ' + data);
                }).stderr.on('data', function (data) {
                    reject(data);
                });
            });

        }).connect({
            host: infrastructure.ip,
            port: 22,
            username: infrastructure.username,
            privateKey: infrastructure.privateKey
        });
    })
}