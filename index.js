"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var url_1 = require("url");
var util_1 = require("util");
var uuid_1 = require("uuid");
// import * as OSS from 'ali-oss';
// tslint:disable-next-line:no-var-requires
var OSS = require('ali-oss');
var Package = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
if (!module.parent) {
    throw new Error('Does not use as plugin');
}
var winston = module.parent.require('winston');
var meta = module.parent.require('./meta');
var nconf = module.parent.require('nconf');
// const im = gm.subClass({ imageMagick: true });
function makeError(err) {
    if (err instanceof Error) {
        err.message = Package.name + " :: " + err.message;
    }
    else {
        err = new Error(Package.name + " :: " + err);
    }
    // =>
    winston.error(err.message);
    return err;
}
var settings = {
    accessKeyId: process.env.OSS_ACCESS_KEY_ID || nconf.get('alioss:accessKeyId'),
    bucket: process.env.OSS_UPLOADS_BUCKET || nconf.get('alioss:bucket'),
    host: process.env.OSS_UPLOADS_HOST || nconf.get('alioss:host'),
    path: process.env.OSS_UPLOADS_PATH || nconf.get('alioss:path'),
    region: process.env.OSS_DEFAULT_REGION || nconf.get('alioss:region'),
    secretAccessKey: process.env.OSS_SECRET_ACCESS_KEY || nconf.get('alioss:accessKeySecret'),
};
var OSSPlugin = /** @class */ (function () {
    function OSSPlugin() {
        if (!settings.accessKeyId) {
            throw new Error("Can not find OSS_ACCESS_KEY_ID in ENV");
        }
        if (!settings.bucket) {
            throw new Error("Can not find OSS_UPLOADS_BUCKET in ENV");
        }
        if (!settings.host) {
            throw new Error("Can not find OSS_UPLOADS_HOST in ENV");
        }
        if (!settings.path) {
            throw new Error("Can not find OSS_UPLOADS_PATH in ENV");
        }
        if (!settings.region) {
            throw new Error("Can not find OSS_DEFAULT_REGION in ENV");
        }
        if (!settings.secretAccessKey) {
            throw new Error("Can not find OSS_SECRET_ACCESS_KEY in ENV");
        }
        this.settings = settings;
        this.client = new OSS.Wrapper({
            accessKeyId: this.settings.accessKeyId,
            accessKeySecret: this.settings.secretAccessKey,
            bucket: this.settings.bucket,
            region: this.settings.region,
        });
    }
    OSSPlugin.prototype.activate = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.client = new OSS.Wrapper({
                    accessKeyId: this.settings.accessKeyId,
                    accessKeySecret: this.settings.secretAccessKey,
                    bucket: this.settings.bucket,
                    region: this.settings.region,
                });
                return [2 /*return*/];
            });
        });
    };
    OSSPlugin.prototype.deactivate = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.client = null;
                return [2 /*return*/];
            });
        });
    };
    OSSPlugin.prototype.uploadFile = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (data.file.size > parseInt(meta.config.maximumFileSize, 10) * 1024) {
                            winston.error('error:file-too-big, ' + meta.config.maximumFileSize);
                            throw new Error("[[error:file-too-big, " + meta.config.maximumFileSize + "]]");
                        }
                        // tslint:disable-next-line:no-console
                        console.log(1, this.uploadToOss);
                        return [4 /*yield*/, this.uploadToOss(data.file.name, data.file.path)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_1 = _a.sent();
                        throw makeError(error_1);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    OSSPlugin.prototype.uploadImage = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var type, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (data.image.size > parseInt(meta.config.maximumFileSize, 10) * 1024) {
                            winston.error('error:file-too-big, ' + meta.config.maximumFileSize);
                            throw new Error("[[error:file-too-big, " + meta.config.maximumFileSize + "]]");
                        }
                        type = data.image.url ? 'url' : 'file';
                        if (!(type === 'file')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.uploadToOss(data.image.name, data.image.path)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: throw new Error('not implement');
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        throw makeError(error_2);
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    OSSPlugin.prototype.uploadToOss = function (filename, tempFilepath) {
        return __awaiter(this, void 0, void 0, function () {
            var stats, ossPath, ossKeyPath, objKey, result, ossUrl, hostUrl;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, util_1.promisify(fs.stat)(tempFilepath)];
                    case 1:
                        stats = _a.sent();
                        ossPath = /\/$/.test(this.settings.path) ?
                            this.settings.path :
                            this.settings.path + "/";
                        ossKeyPath = ossPath.replace(/^\//, '');
                        objKey = "" + ossKeyPath + uuid_1.v4() + path.parse(filename).ext;
                        return [4 /*yield*/, this.client.put(objKey, tempFilepath)];
                    case 2:
                        result = _a.sent();
                        ossUrl = new url_1.URL(result.url);
                        hostUrl = new url_1.URL(this.settings.host);
                        hostUrl.pathname = ossUrl.pathname;
                        return [2 /*return*/, { name: filename, url: hostUrl.href }];
                }
            });
        });
    };
    return OSSPlugin;
}());
var plugin = new OSSPlugin();
module.exports = {
    activate: util_1.callbackify(plugin.activate).bind(plugin),
    deactivate: util_1.callbackify(plugin.deactivate).bind(plugin),
    uploadFile: util_1.callbackify(plugin.uploadFile).bind(plugin),
    uploadImage: util_1.callbackify(plugin.uploadImage).bind(plugin),
};
