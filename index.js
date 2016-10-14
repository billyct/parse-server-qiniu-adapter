const qiniu = require('qiniu');

function QiniuAdapter() {

    let qiniuOptions = arguments[0];

    if (typeof qiniuOptions !== 'object') {
        throw new Error('arguments must be an object');
    }

    this.options = {
        access_key: qiniuOptions['access_key'] || 'access_key',
        secret_key: qiniuOptions['secret_key'] || 'secret_key',
        bucket: qiniuOptions['bucket'] || 'bucket',
        domain: qiniuOptions['domain'] || 'http://domain.com',
    };

    qiniu.conf.ACCESS_KEY = this.options.access_key;
    qiniu.conf.SECRET_KEY = this.options.secret_key;
}


QiniuAdapter.prototype.createFile = function(filename, data, contentType) {
    //filename 作为 key
    const putPolicy = new qiniu.rs.PutPolicy(`${this.options.bucket}:${filename}`);
    const token = putPolicy.token();
    return new Promise((resolve, reject) => {
        qiniu.io.putFile(token, filename, data, (err, res) => {
            if (err) {
                return reject(err);
            }
            resolve(res);
        });
    });
}

QiniuAdapter.prototype.deleteFile = function(filename) {
    const client = new qiniu.rs.Client();
    return new Promise((resolve, reject) => {
        client.remove(this.options.bucket, filename, (err, res) => {
        	if (err) {
        		return reject(err);
        	}
        	resolve(res);
        });
    });
}

QiniuAdapter.prototype.getFileData = function(filename) {
    //qiniu貌似没有提供返回数据的整个data的接口，当然我们可以自己request download url来取这个data
	return null
}

QiniuAdapter.prototype.getFileLocation = function(config, filename) {
	const url = `${this.options.domain}/${filename}`;
	const policy = new qiniu.rs.GetPolicy();
	return policy.makeRequest(url);
}

module.exports = QiniuAdapter;
