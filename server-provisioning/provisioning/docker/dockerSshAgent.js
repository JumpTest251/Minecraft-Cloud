var Client = require('ssh2').Client,
    http = require('http');

module.exports = function (opt) {
    var agent = new http.Agent();
    let retries = 5;

    agent.createConnection = function (options, fn) {
        var conn = new Client();

        conn.on('ready', function () {
            console.log('con ready');
            conn.exec('docker system dial-stdio', function (err, stream) {
                console.log('exec')
                if (err) {

                    conn.end();
                    agent.destroy();
                    return;
                }

                fn(null, stream);

                stream.on('close', () => {
                    conn.end();
                    agent.destroy();
                });
            });
        }).connect(opt);

        conn.on('error', error => {
            console.log('retrying in 3 seconds... ' + retries)
            if (retries > 0) {
                retries--;
                setTimeout(() => conn.connect(opt), 3 * 1000)

            } else {
                console.log('Error in docker ssh agent: ' + error);
            }

        })
        conn.on('end', () => agent.destroy());

    };

    return agent;
};