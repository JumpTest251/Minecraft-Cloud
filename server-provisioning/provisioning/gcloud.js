const { Storage } = require('@google-cloud/storage');
const config = require('../utils/config');

const bucketName = 'mcloudb'

const storage = new Storage({
    projectId: config.gcloudProject,
    credentials: {
        private_key: config.gcloudKey.replace(/\\n/g, '\n'),
        client_email: config.gcloudEmail
    }
})


module.exports.listFiles = function (prefix, versions = false) {
    return storage.bucket(bucketName).getFiles({
        prefix,
        versions
    })
}

module.exports.deleteFiles = function (prefix, versions = false) {
    return storage.bucket(bucketName).deleteFiles({
        prefix,
        versions,
        force: true
    })
}

module.exports.createSignedUrl = function (file, generation) {
    return storage.bucket(bucketName)
        .file(file, { generation })
        .getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 30 * 60 * 1000
        })
}

module.exports.buildPrefix = function (serverTemplate, full = false) {
    return `${serverTemplate.createdBy.toLowerCase()}/${serverTemplate.name.toLowerCase()}` + (full ? '/backup.tar.gz' : '')
}

module.exports.bucketName = bucketName;