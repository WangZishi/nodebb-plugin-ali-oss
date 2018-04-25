"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const mime = __importStar(require("mime"));
const util_1 = require("util");
const uuid_1 = require("uuid");
// import * as OSS from 'ali-oss';
// tslint:disable-next-line:no-var-requires
const OSS = require('ali-oss');
const Package = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
if (!module.parent) {
    throw new Error('Does not use as plugin');
}
const winston = module.parent.require('winston');
const meta = module.parent.require('./meta');
// const im = gm.subClass({ imageMagick: true });
function makeError(err) {
    if (err instanceof Error) {
        err.message = `${Package.name} :: ${err.message}`;
    }
    else {
        err = new Error(`${Package.name} :: ${err}`);
    }
    winston.error(err.message);
    return err;
}
const settings = {
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    bucket: process.env.OSS_UPLOADS_BUCKET,
    host: process.env.OSS_UPLOADS_HOST,
    path: process.env.OSS_UPLOADS_PATH,
    region: process.env.OSS_DEFAULT_REGION,
    secretAccessKey: process.env.OSS_SECRET_ACCESS_KEY,
};
class OSSPlugin {
    constructor() {
        this.activate = util_1.callbackify(this.activateInternal);
        this.deactivate = util_1.callbackify(this.deactivateInternal);
        this.uploadFile = util_1.callbackify(this.uploadFileInternal);
        this.uploadImage = util_1.callbackify(this.uploadImageInternal);
        if (!settings.accessKeyId) {
            throw new Error(`Can not find OSS_ACCESS_KEY_ID in ENV`);
        }
        if (!settings.bucket) {
            throw new Error(`Can not find OSS_UPLOADS_BUCKET in ENV`);
        }
        if (!settings.path) {
            throw new Error(`Can not find OSS_UPLOADS_PATH in ENV`);
        }
        if (!settings.region) {
            throw new Error(`Can not find OSS_DEFAULT_REGION in ENV`);
        }
        if (!settings.secretAccessKey) {
            throw new Error(`Can not find OSS_SECRET_ACCESS_KEY in ENV`);
        }
        this.settings = settings;
    }
    async activateInternal() {
        this.client = new OSS.Wrapper({
            accessKeyId: this.settings.accessKeyId,
            accessKeySecret: this.settings.secretAccessKey,
            bucket: this.settings.bucket,
            region: this.settings.region,
        });
    }
    async deactivateInternal() {
        this.client = null;
    }
    async uploadFileInternal(data) {
        try {
            if (data.file.size > parseInt(meta.config.maximumFileSize, 10) * 1024) {
                winston.error('error:file-too-big, ' + meta.config.maximumFileSize);
                throw new Error(`[[error:file-too-big, ${meta.config.maximumFileSize}]]`);
            }
            // tslint:disable-next-line:no-console
            console.log(1, this.uploadToOss);
            return await this.uploadToOss(data.file.name, data.file.path);
        }
        catch (error) {
            throw makeError(error);
        }
    }
    async uploadImageInternal(data) {
        try {
            if (data.image.size > parseInt(meta.config.maximumFileSize, 10) * 1024) {
                winston.error('error:file-too-big, ' + meta.config.maximumFileSize);
                throw new Error(`[[error:file-too-big, ${meta.config.maximumFileSize}]]`);
            }
            const type = data.image.url ? 'url' : 'file';
            if (type === 'file') {
                // tslint:disable-next-line:no-console
                console.log(1, this.uploadToOss);
                return await this.uploadToOss(data.image.name, data.image.path);
            }
            else {
                throw new Error('not implement');
            }
        }
        catch (error) {
            throw makeError(error);
        }
    }
    async uploadToOss(filename, tempFilepath) {
        const stats = await util_1.promisify(fs.stat)(tempFilepath);
        const ossPath = /\/$/.test(this.settings.path) ?
            this.settings.path :
            `${this.settings.path}/`;
        const ossKeyPath = ossPath.replace(/^\//, '');
        const objKey = `${ossKeyPath}${uuid_1.v4()}.${mime.getExtension(mime.getType(filename))}`;
        const result = await this.client.put(objKey, tempFilepath);
        return { name: filename, url: result.url };
    }
}
module.exports = new OSSPlugin();
