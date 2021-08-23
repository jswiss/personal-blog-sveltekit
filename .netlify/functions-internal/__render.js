var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// .svelte-kit/netlify/entry.js
__export(exports, {
  handler: () => handler
});

// node_modules/@sveltejs/kit/dist/install-fetch.js
var import_http = __toModule(require("http"));
var import_https = __toModule(require("https"));
var import_zlib = __toModule(require("zlib"));
var import_stream = __toModule(require("stream"));
var import_util = __toModule(require("util"));
var import_crypto = __toModule(require("crypto"));
var import_url = __toModule(require("url"));
function dataUriToBuffer(uri) {
  if (!/^data:/i.test(uri)) {
    throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
  }
  uri = uri.replace(/\r?\n/g, "");
  const firstComma = uri.indexOf(",");
  if (firstComma === -1 || firstComma <= 4) {
    throw new TypeError("malformed data: URI");
  }
  const meta = uri.substring(5, firstComma).split(";");
  let charset = "";
  let base64 = false;
  const type = meta[0] || "text/plain";
  let typeFull = type;
  for (let i = 1; i < meta.length; i++) {
    if (meta[i] === "base64") {
      base64 = true;
    } else {
      typeFull += `;${meta[i]}`;
      if (meta[i].indexOf("charset=") === 0) {
        charset = meta[i].substring(8);
      }
    }
  }
  if (!meta[0] && !charset.length) {
    typeFull += ";charset=US-ASCII";
    charset = "US-ASCII";
  }
  const encoding = base64 ? "base64" : "ascii";
  const data = unescape(uri.substring(firstComma + 1));
  const buffer = Buffer.from(data, encoding);
  buffer.type = type;
  buffer.typeFull = typeFull;
  buffer.charset = charset;
  return buffer;
}
var src = dataUriToBuffer;
var { Readable } = import_stream.default;
var wm = new WeakMap();
async function* read(parts) {
  for (const part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else {
      yield part;
    }
  }
}
var Blob = class {
  constructor(blobParts = [], options2 = {}) {
    let size = 0;
    const parts = blobParts.map((element) => {
      let buffer;
      if (element instanceof Buffer) {
        buffer = element;
      } else if (ArrayBuffer.isView(element)) {
        buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
      } else if (element instanceof ArrayBuffer) {
        buffer = Buffer.from(element);
      } else if (element instanceof Blob) {
        buffer = element;
      } else {
        buffer = Buffer.from(typeof element === "string" ? element : String(element));
      }
      size += buffer.length || buffer.size || 0;
      return buffer;
    });
    const type = options2.type === void 0 ? "" : String(options2.type).toLowerCase();
    wm.set(this, {
      type: /[^\u0020-\u007E]/.test(type) ? "" : type,
      size,
      parts
    });
  }
  get size() {
    return wm.get(this).size;
  }
  get type() {
    return wm.get(this).type;
  }
  async text() {
    return Buffer.from(await this.arrayBuffer()).toString();
  }
  async arrayBuffer() {
    const data = new Uint8Array(this.size);
    let offset = 0;
    for await (const chunk of this.stream()) {
      data.set(chunk, offset);
      offset += chunk.length;
    }
    return data.buffer;
  }
  stream() {
    return Readable.from(read(wm.get(this).parts));
  }
  slice(start = 0, end = this.size, type = "") {
    const { size } = this;
    let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
    let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
    const span = Math.max(relativeEnd - relativeStart, 0);
    const parts = wm.get(this).parts.values();
    const blobParts = [];
    let added = 0;
    for (const part of parts) {
      const size2 = ArrayBuffer.isView(part) ? part.byteLength : part.size;
      if (relativeStart && size2 <= relativeStart) {
        relativeStart -= size2;
        relativeEnd -= size2;
      } else {
        const chunk = part.slice(relativeStart, Math.min(size2, relativeEnd));
        blobParts.push(chunk);
        added += ArrayBuffer.isView(chunk) ? chunk.byteLength : chunk.size;
        relativeStart = 0;
        if (added >= span) {
          break;
        }
      }
    }
    const blob = new Blob([], { type: String(type).toLowerCase() });
    Object.assign(wm.get(blob), { size: span, parts: blobParts });
    return blob;
  }
  get [Symbol.toStringTag]() {
    return "Blob";
  }
  static [Symbol.hasInstance](object) {
    return object && typeof object === "object" && typeof object.stream === "function" && object.stream.length === 0 && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[Symbol.toStringTag]);
  }
};
Object.defineProperties(Blob.prototype, {
  size: { enumerable: true },
  type: { enumerable: true },
  slice: { enumerable: true }
});
var fetchBlob = Blob;
var FetchBaseError = class extends Error {
  constructor(message, type) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.type = type;
  }
  get name() {
    return this.constructor.name;
  }
  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }
};
var FetchError = class extends FetchBaseError {
  constructor(message, type, systemError) {
    super(message, type);
    if (systemError) {
      this.code = this.errno = systemError.code;
      this.erroredSysCall = systemError.syscall;
    }
  }
};
var NAME = Symbol.toStringTag;
var isURLSearchParameters = (object) => {
  return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
};
var isBlob = (object) => {
  return typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
};
function isFormData(object) {
  return typeof object === "object" && typeof object.append === "function" && typeof object.set === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.delete === "function" && typeof object.keys === "function" && typeof object.values === "function" && typeof object.entries === "function" && typeof object.constructor === "function" && object[NAME] === "FormData";
}
var isAbortSignal = (object) => {
  return typeof object === "object" && object[NAME] === "AbortSignal";
};
var carriage = "\r\n";
var dashes = "-".repeat(2);
var carriageLength = Buffer.byteLength(carriage);
var getFooter = (boundary) => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;
function getHeader(boundary, name, field) {
  let header = "";
  header += `${dashes}${boundary}${carriage}`;
  header += `Content-Disposition: form-data; name="${name}"`;
  if (isBlob(field)) {
    header += `; filename="${field.name}"${carriage}`;
    header += `Content-Type: ${field.type || "application/octet-stream"}`;
  }
  return `${header}${carriage.repeat(2)}`;
}
var getBoundary = () => (0, import_crypto.randomBytes)(8).toString("hex");
async function* formDataIterator(form, boundary) {
  for (const [name, value] of form) {
    yield getHeader(boundary, name, value);
    if (isBlob(value)) {
      yield* value.stream();
    } else {
      yield value;
    }
    yield carriage;
  }
  yield getFooter(boundary);
}
function getFormDataLength(form, boundary) {
  let length = 0;
  for (const [name, value] of form) {
    length += Buffer.byteLength(getHeader(boundary, name, value));
    if (isBlob(value)) {
      length += value.size;
    } else {
      length += Buffer.byteLength(String(value));
    }
    length += carriageLength;
  }
  length += Buffer.byteLength(getFooter(boundary));
  return length;
}
var INTERNALS$2 = Symbol("Body internals");
var Body = class {
  constructor(body, {
    size = 0
  } = {}) {
    let boundary = null;
    if (body === null) {
      body = null;
    } else if (isURLSearchParameters(body)) {
      body = Buffer.from(body.toString());
    } else if (isBlob(body))
      ;
    else if (Buffer.isBuffer(body))
      ;
    else if (import_util.types.isAnyArrayBuffer(body)) {
      body = Buffer.from(body);
    } else if (ArrayBuffer.isView(body)) {
      body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
    } else if (body instanceof import_stream.default)
      ;
    else if (isFormData(body)) {
      boundary = `NodeFetchFormDataBoundary${getBoundary()}`;
      body = import_stream.default.Readable.from(formDataIterator(body, boundary));
    } else {
      body = Buffer.from(String(body));
    }
    this[INTERNALS$2] = {
      body,
      boundary,
      disturbed: false,
      error: null
    };
    this.size = size;
    if (body instanceof import_stream.default) {
      body.on("error", (err) => {
        const error3 = err instanceof FetchBaseError ? err : new FetchError(`Invalid response body while trying to fetch ${this.url}: ${err.message}`, "system", err);
        this[INTERNALS$2].error = error3;
      });
    }
  }
  get body() {
    return this[INTERNALS$2].body;
  }
  get bodyUsed() {
    return this[INTERNALS$2].disturbed;
  }
  async arrayBuffer() {
    const { buffer, byteOffset, byteLength } = await consumeBody(this);
    return buffer.slice(byteOffset, byteOffset + byteLength);
  }
  async blob() {
    const ct = this.headers && this.headers.get("content-type") || this[INTERNALS$2].body && this[INTERNALS$2].body.type || "";
    const buf = await this.buffer();
    return new fetchBlob([buf], {
      type: ct
    });
  }
  async json() {
    const buffer = await consumeBody(this);
    return JSON.parse(buffer.toString());
  }
  async text() {
    const buffer = await consumeBody(this);
    return buffer.toString();
  }
  buffer() {
    return consumeBody(this);
  }
};
Object.defineProperties(Body.prototype, {
  body: { enumerable: true },
  bodyUsed: { enumerable: true },
  arrayBuffer: { enumerable: true },
  blob: { enumerable: true },
  json: { enumerable: true },
  text: { enumerable: true }
});
async function consumeBody(data) {
  if (data[INTERNALS$2].disturbed) {
    throw new TypeError(`body used already for: ${data.url}`);
  }
  data[INTERNALS$2].disturbed = true;
  if (data[INTERNALS$2].error) {
    throw data[INTERNALS$2].error;
  }
  let { body } = data;
  if (body === null) {
    return Buffer.alloc(0);
  }
  if (isBlob(body)) {
    body = body.stream();
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (!(body instanceof import_stream.default)) {
    return Buffer.alloc(0);
  }
  const accum = [];
  let accumBytes = 0;
  try {
    for await (const chunk of body) {
      if (data.size > 0 && accumBytes + chunk.length > data.size) {
        const err = new FetchError(`content size at ${data.url} over limit: ${data.size}`, "max-size");
        body.destroy(err);
        throw err;
      }
      accumBytes += chunk.length;
      accum.push(chunk);
    }
  } catch (error3) {
    if (error3 instanceof FetchBaseError) {
      throw error3;
    } else {
      throw new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error3.message}`, "system", error3);
    }
  }
  if (body.readableEnded === true || body._readableState.ended === true) {
    try {
      if (accum.every((c) => typeof c === "string")) {
        return Buffer.from(accum.join(""));
      }
      return Buffer.concat(accum, accumBytes);
    } catch (error3) {
      throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error3.message}`, "system", error3);
    }
  } else {
    throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
  }
}
var clone = (instance, highWaterMark) => {
  let p1;
  let p2;
  let { body } = instance;
  if (instance.bodyUsed) {
    throw new Error("cannot clone body after it is used");
  }
  if (body instanceof import_stream.default && typeof body.getBoundary !== "function") {
    p1 = new import_stream.PassThrough({ highWaterMark });
    p2 = new import_stream.PassThrough({ highWaterMark });
    body.pipe(p1);
    body.pipe(p2);
    instance[INTERNALS$2].body = p1;
    body = p2;
  }
  return body;
};
var extractContentType = (body, request) => {
  if (body === null) {
    return null;
  }
  if (typeof body === "string") {
    return "text/plain;charset=UTF-8";
  }
  if (isURLSearchParameters(body)) {
    return "application/x-www-form-urlencoded;charset=UTF-8";
  }
  if (isBlob(body)) {
    return body.type || null;
  }
  if (Buffer.isBuffer(body) || import_util.types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) {
    return null;
  }
  if (body && typeof body.getBoundary === "function") {
    return `multipart/form-data;boundary=${body.getBoundary()}`;
  }
  if (isFormData(body)) {
    return `multipart/form-data; boundary=${request[INTERNALS$2].boundary}`;
  }
  if (body instanceof import_stream.default) {
    return null;
  }
  return "text/plain;charset=UTF-8";
};
var getTotalBytes = (request) => {
  const { body } = request;
  if (body === null) {
    return 0;
  }
  if (isBlob(body)) {
    return body.size;
  }
  if (Buffer.isBuffer(body)) {
    return body.length;
  }
  if (body && typeof body.getLengthSync === "function") {
    return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
  }
  if (isFormData(body)) {
    return getFormDataLength(request[INTERNALS$2].boundary);
  }
  return null;
};
var writeToStream = (dest, { body }) => {
  if (body === null) {
    dest.end();
  } else if (isBlob(body)) {
    body.stream().pipe(dest);
  } else if (Buffer.isBuffer(body)) {
    dest.write(body);
    dest.end();
  } else {
    body.pipe(dest);
  }
};
var validateHeaderName = typeof import_http.default.validateHeaderName === "function" ? import_http.default.validateHeaderName : (name) => {
  if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
    const err = new TypeError(`Header name must be a valid HTTP token [${name}]`);
    Object.defineProperty(err, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
    throw err;
  }
};
var validateHeaderValue = typeof import_http.default.validateHeaderValue === "function" ? import_http.default.validateHeaderValue : (name, value) => {
  if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
    const err = new TypeError(`Invalid character in header content ["${name}"]`);
    Object.defineProperty(err, "code", { value: "ERR_INVALID_CHAR" });
    throw err;
  }
};
var Headers = class extends URLSearchParams {
  constructor(init2) {
    let result = [];
    if (init2 instanceof Headers) {
      const raw = init2.raw();
      for (const [name, values] of Object.entries(raw)) {
        result.push(...values.map((value) => [name, value]));
      }
    } else if (init2 == null)
      ;
    else if (typeof init2 === "object" && !import_util.types.isBoxedPrimitive(init2)) {
      const method = init2[Symbol.iterator];
      if (method == null) {
        result.push(...Object.entries(init2));
      } else {
        if (typeof method !== "function") {
          throw new TypeError("Header pairs must be iterable");
        }
        result = [...init2].map((pair) => {
          if (typeof pair !== "object" || import_util.types.isBoxedPrimitive(pair)) {
            throw new TypeError("Each header pair must be an iterable object");
          }
          return [...pair];
        }).map((pair) => {
          if (pair.length !== 2) {
            throw new TypeError("Each header pair must be a name/value tuple");
          }
          return [...pair];
        });
      }
    } else {
      throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
    }
    result = result.length > 0 ? result.map(([name, value]) => {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return [String(name).toLowerCase(), String(value)];
    }) : void 0;
    super(result);
    return new Proxy(this, {
      get(target, p, receiver) {
        switch (p) {
          case "append":
          case "set":
            return (name, value) => {
              validateHeaderName(name);
              validateHeaderValue(name, String(value));
              return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase(), String(value));
            };
          case "delete":
          case "has":
          case "getAll":
            return (name) => {
              validateHeaderName(name);
              return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase());
            };
          case "keys":
            return () => {
              target.sort();
              return new Set(URLSearchParams.prototype.keys.call(target)).keys();
            };
          default:
            return Reflect.get(target, p, receiver);
        }
      }
    });
  }
  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }
  toString() {
    return Object.prototype.toString.call(this);
  }
  get(name) {
    const values = this.getAll(name);
    if (values.length === 0) {
      return null;
    }
    let value = values.join(", ");
    if (/^content-encoding$/i.test(name)) {
      value = value.toLowerCase();
    }
    return value;
  }
  forEach(callback) {
    for (const name of this.keys()) {
      callback(this.get(name), name);
    }
  }
  *values() {
    for (const name of this.keys()) {
      yield this.get(name);
    }
  }
  *entries() {
    for (const name of this.keys()) {
      yield [name, this.get(name)];
    }
  }
  [Symbol.iterator]() {
    return this.entries();
  }
  raw() {
    return [...this.keys()].reduce((result, key) => {
      result[key] = this.getAll(key);
      return result;
    }, {});
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return [...this.keys()].reduce((result, key) => {
      const values = this.getAll(key);
      if (key === "host") {
        result[key] = values[0];
      } else {
        result[key] = values.length > 1 ? values : values[0];
      }
      return result;
    }, {});
  }
};
Object.defineProperties(Headers.prototype, ["get", "entries", "forEach", "values"].reduce((result, property) => {
  result[property] = { enumerable: true };
  return result;
}, {}));
function fromRawHeaders(headers = []) {
  return new Headers(headers.reduce((result, value, index2, array) => {
    if (index2 % 2 === 0) {
      result.push(array.slice(index2, index2 + 2));
    }
    return result;
  }, []).filter(([name, value]) => {
    try {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return true;
    } catch {
      return false;
    }
  }));
}
var redirectStatus = new Set([301, 302, 303, 307, 308]);
var isRedirect = (code) => {
  return redirectStatus.has(code);
};
var INTERNALS$1 = Symbol("Response internals");
var Response = class extends Body {
  constructor(body = null, options2 = {}) {
    super(body, options2);
    const status = options2.status || 200;
    const headers = new Headers(options2.headers);
    if (body !== null && !headers.has("Content-Type")) {
      const contentType = extractContentType(body);
      if (contentType) {
        headers.append("Content-Type", contentType);
      }
    }
    this[INTERNALS$1] = {
      url: options2.url,
      status,
      statusText: options2.statusText || "",
      headers,
      counter: options2.counter,
      highWaterMark: options2.highWaterMark
    };
  }
  get url() {
    return this[INTERNALS$1].url || "";
  }
  get status() {
    return this[INTERNALS$1].status;
  }
  get ok() {
    return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
  }
  get redirected() {
    return this[INTERNALS$1].counter > 0;
  }
  get statusText() {
    return this[INTERNALS$1].statusText;
  }
  get headers() {
    return this[INTERNALS$1].headers;
  }
  get highWaterMark() {
    return this[INTERNALS$1].highWaterMark;
  }
  clone() {
    return new Response(clone(this, this.highWaterMark), {
      url: this.url,
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
      ok: this.ok,
      redirected: this.redirected,
      size: this.size
    });
  }
  static redirect(url, status = 302) {
    if (!isRedirect(status)) {
      throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
    }
    return new Response(null, {
      headers: {
        location: new URL(url).toString()
      },
      status
    });
  }
  get [Symbol.toStringTag]() {
    return "Response";
  }
};
Object.defineProperties(Response.prototype, {
  url: { enumerable: true },
  status: { enumerable: true },
  ok: { enumerable: true },
  redirected: { enumerable: true },
  statusText: { enumerable: true },
  headers: { enumerable: true },
  clone: { enumerable: true }
});
var getSearch = (parsedURL) => {
  if (parsedURL.search) {
    return parsedURL.search;
  }
  const lastOffset = parsedURL.href.length - 1;
  const hash2 = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
  return parsedURL.href[lastOffset - hash2.length] === "?" ? "?" : "";
};
var INTERNALS = Symbol("Request internals");
var isRequest = (object) => {
  return typeof object === "object" && typeof object[INTERNALS] === "object";
};
var Request = class extends Body {
  constructor(input, init2 = {}) {
    let parsedURL;
    if (isRequest(input)) {
      parsedURL = new URL(input.url);
    } else {
      parsedURL = new URL(input);
      input = {};
    }
    let method = init2.method || input.method || "GET";
    method = method.toUpperCase();
    if ((init2.body != null || isRequest(input)) && input.body !== null && (method === "GET" || method === "HEAD")) {
      throw new TypeError("Request with GET/HEAD method cannot have body");
    }
    const inputBody = init2.body ? init2.body : isRequest(input) && input.body !== null ? clone(input) : null;
    super(inputBody, {
      size: init2.size || input.size || 0
    });
    const headers = new Headers(init2.headers || input.headers || {});
    if (inputBody !== null && !headers.has("Content-Type")) {
      const contentType = extractContentType(inputBody, this);
      if (contentType) {
        headers.append("Content-Type", contentType);
      }
    }
    let signal = isRequest(input) ? input.signal : null;
    if ("signal" in init2) {
      signal = init2.signal;
    }
    if (signal !== null && !isAbortSignal(signal)) {
      throw new TypeError("Expected signal to be an instanceof AbortSignal");
    }
    this[INTERNALS] = {
      method,
      redirect: init2.redirect || input.redirect || "follow",
      headers,
      parsedURL,
      signal
    };
    this.follow = init2.follow === void 0 ? input.follow === void 0 ? 20 : input.follow : init2.follow;
    this.compress = init2.compress === void 0 ? input.compress === void 0 ? true : input.compress : init2.compress;
    this.counter = init2.counter || input.counter || 0;
    this.agent = init2.agent || input.agent;
    this.highWaterMark = init2.highWaterMark || input.highWaterMark || 16384;
    this.insecureHTTPParser = init2.insecureHTTPParser || input.insecureHTTPParser || false;
  }
  get method() {
    return this[INTERNALS].method;
  }
  get url() {
    return (0, import_url.format)(this[INTERNALS].parsedURL);
  }
  get headers() {
    return this[INTERNALS].headers;
  }
  get redirect() {
    return this[INTERNALS].redirect;
  }
  get signal() {
    return this[INTERNALS].signal;
  }
  clone() {
    return new Request(this);
  }
  get [Symbol.toStringTag]() {
    return "Request";
  }
};
Object.defineProperties(Request.prototype, {
  method: { enumerable: true },
  url: { enumerable: true },
  headers: { enumerable: true },
  redirect: { enumerable: true },
  clone: { enumerable: true },
  signal: { enumerable: true }
});
var getNodeRequestOptions = (request) => {
  const { parsedURL } = request[INTERNALS];
  const headers = new Headers(request[INTERNALS].headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "*/*");
  }
  let contentLengthValue = null;
  if (request.body === null && /^(post|put)$/i.test(request.method)) {
    contentLengthValue = "0";
  }
  if (request.body !== null) {
    const totalBytes = getTotalBytes(request);
    if (typeof totalBytes === "number" && !Number.isNaN(totalBytes)) {
      contentLengthValue = String(totalBytes);
    }
  }
  if (contentLengthValue) {
    headers.set("Content-Length", contentLengthValue);
  }
  if (!headers.has("User-Agent")) {
    headers.set("User-Agent", "node-fetch");
  }
  if (request.compress && !headers.has("Accept-Encoding")) {
    headers.set("Accept-Encoding", "gzip,deflate,br");
  }
  let { agent } = request;
  if (typeof agent === "function") {
    agent = agent(parsedURL);
  }
  if (!headers.has("Connection") && !agent) {
    headers.set("Connection", "close");
  }
  const search = getSearch(parsedURL);
  const requestOptions = {
    path: parsedURL.pathname + search,
    pathname: parsedURL.pathname,
    hostname: parsedURL.hostname,
    protocol: parsedURL.protocol,
    port: parsedURL.port,
    hash: parsedURL.hash,
    search: parsedURL.search,
    query: parsedURL.query,
    href: parsedURL.href,
    method: request.method,
    headers: headers[Symbol.for("nodejs.util.inspect.custom")](),
    insecureHTTPParser: request.insecureHTTPParser,
    agent
  };
  return requestOptions;
};
var AbortError = class extends FetchBaseError {
  constructor(message, type = "aborted") {
    super(message, type);
  }
};
var supportedSchemas = new Set(["data:", "http:", "https:"]);
async function fetch(url, options_) {
  return new Promise((resolve2, reject) => {
    const request = new Request(url, options_);
    const options2 = getNodeRequestOptions(request);
    if (!supportedSchemas.has(options2.protocol)) {
      throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${options2.protocol.replace(/:$/, "")}" is not supported.`);
    }
    if (options2.protocol === "data:") {
      const data = src(request.url);
      const response2 = new Response(data, { headers: { "Content-Type": data.typeFull } });
      resolve2(response2);
      return;
    }
    const send = (options2.protocol === "https:" ? import_https.default : import_http.default).request;
    const { signal } = request;
    let response = null;
    const abort = () => {
      const error3 = new AbortError("The operation was aborted.");
      reject(error3);
      if (request.body && request.body instanceof import_stream.default.Readable) {
        request.body.destroy(error3);
      }
      if (!response || !response.body) {
        return;
      }
      response.body.emit("error", error3);
    };
    if (signal && signal.aborted) {
      abort();
      return;
    }
    const abortAndFinalize = () => {
      abort();
      finalize();
    };
    const request_ = send(options2);
    if (signal) {
      signal.addEventListener("abort", abortAndFinalize);
    }
    const finalize = () => {
      request_.abort();
      if (signal) {
        signal.removeEventListener("abort", abortAndFinalize);
      }
    };
    request_.on("error", (err) => {
      reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, "system", err));
      finalize();
    });
    request_.on("response", (response_) => {
      request_.setTimeout(0);
      const headers = fromRawHeaders(response_.rawHeaders);
      if (isRedirect(response_.statusCode)) {
        const location = headers.get("Location");
        const locationURL = location === null ? null : new URL(location, request.url);
        switch (request.redirect) {
          case "error":
            reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
            finalize();
            return;
          case "manual":
            if (locationURL !== null) {
              try {
                headers.set("Location", locationURL);
              } catch (error3) {
                reject(error3);
              }
            }
            break;
          case "follow": {
            if (locationURL === null) {
              break;
            }
            if (request.counter >= request.follow) {
              reject(new FetchError(`maximum redirect reached at: ${request.url}`, "max-redirect"));
              finalize();
              return;
            }
            const requestOptions = {
              headers: new Headers(request.headers),
              follow: request.follow,
              counter: request.counter + 1,
              agent: request.agent,
              compress: request.compress,
              method: request.method,
              body: request.body,
              signal: request.signal,
              size: request.size
            };
            if (response_.statusCode !== 303 && request.body && options_.body instanceof import_stream.default.Readable) {
              reject(new FetchError("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
              finalize();
              return;
            }
            if (response_.statusCode === 303 || (response_.statusCode === 301 || response_.statusCode === 302) && request.method === "POST") {
              requestOptions.method = "GET";
              requestOptions.body = void 0;
              requestOptions.headers.delete("content-length");
            }
            resolve2(fetch(new Request(locationURL, requestOptions)));
            finalize();
            return;
          }
        }
      }
      response_.once("end", () => {
        if (signal) {
          signal.removeEventListener("abort", abortAndFinalize);
        }
      });
      let body = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error3) => {
        reject(error3);
      });
      if (process.version < "v12.10") {
        response_.on("aborted", abortAndFinalize);
      }
      const responseOptions = {
        url: request.url,
        status: response_.statusCode,
        statusText: response_.statusMessage,
        headers,
        size: request.size,
        counter: request.counter,
        highWaterMark: request.highWaterMark
      };
      const codings = headers.get("Content-Encoding");
      if (!request.compress || request.method === "HEAD" || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      const zlibOptions = {
        flush: import_zlib.default.Z_SYNC_FLUSH,
        finishFlush: import_zlib.default.Z_SYNC_FLUSH
      };
      if (codings === "gzip" || codings === "x-gzip") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createGunzip(zlibOptions), (error3) => {
          reject(error3);
        });
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      if (codings === "deflate" || codings === "x-deflate") {
        const raw = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error3) => {
          reject(error3);
        });
        raw.once("data", (chunk) => {
          if ((chunk[0] & 15) === 8) {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflate(), (error3) => {
              reject(error3);
            });
          } else {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflateRaw(), (error3) => {
              reject(error3);
            });
          }
          response = new Response(body, responseOptions);
          resolve2(response);
        });
        return;
      }
      if (codings === "br") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createBrotliDecompress(), (error3) => {
          reject(error3);
        });
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      response = new Response(body, responseOptions);
      resolve2(response);
    });
    writeToStream(request_, request);
  });
}
globalThis.fetch = fetch;
globalThis.Response = Response;
globalThis.Request = Request;
globalThis.Headers = Headers;

// node_modules/@sveltejs/kit/dist/ssr.js
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name, thing) {
      params_1.push(name);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name + "[" + i + "]=" + stringify(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name + "." + Array.from(thing).map(function(_a) {
            var k = _a[0], v = _a[1];
            return "set(" + stringify(k) + ", " + stringify(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop() {
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
var subscriber_queue = [];
function writable(value, start = noop) {
  let stop;
  const subscribers = [];
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (let i = 0; i < subscribers.length; i += 1) {
          const s2 = subscribers[i];
          s2[1]();
          subscriber_queue.push(s2, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.push(subscriber);
    if (subscribers.length === 1) {
      stop = start(set) || noop;
    }
    run2(value);
    return () => {
      const index2 = subscribers.indexOf(subscriber);
      if (index2 !== -1) {
        subscribers.splice(index2, 1);
      }
      if (subscribers.length === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
var s$1 = JSON.stringify;
async function render_response({
  options: options2,
  $session,
  page_config,
  status,
  error: error3,
  branch,
  page: page2
}) {
  const css2 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error3) {
    error3.stack = options2.get_stack(error3);
  }
  if (branch) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css2.add(url));
      if (node.js)
        node.js.forEach((url) => js.add(url));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session = writable($session);
    const props = {
      stores: {
        page: writable(null),
        navigating: writable(null),
        session
      },
      page: page2,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css2).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error4) => {
      throw new Error(`Failed to serialize session data: ${error4.message}`);
    })},
				host: ${page2 && page2.host ? s$1(page2.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error3)},
					nodes: [
						${branch.map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page2.host ? s$1(page2.host) : "location.host"}, // TODO this is redundant
						path: ${s$1(page2.path)},
						query: new URLSearchParams(${s$1(page2.query.toString())}),
						params: ${s$1(page2.params)}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body2, json }) => {
    return body2 ? `<script type="svelte-data" url="${url}" body="${hash(body2)}">${json}<\/script>` : `<script type="svelte-data" url="${url}">${json}<\/script>`;
  }).join("\n\n			")}
		`.replace(/^\t{2}/gm, "");
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(err);
    return null;
  }
}
function serialize_error(error3) {
  if (!error3)
    return null;
  let serialized = try_serialize(error3);
  if (!serialized) {
    const { name, message, stack } = error3;
    serialized = try_serialize({ name, message, stack });
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  if (loaded.error) {
    const error3 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    const status = loaded.status;
    if (!(error3 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error3}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error3 };
    }
    return { status, error: error3 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  return loaded;
}
function resolve(base, path) {
  const baseparts = path[0] === "/" ? [] : base.slice(1).split("/");
  const pathparts = path[0] === "/" ? path.slice(1).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  return `/${baseparts.join("/")}`;
}
var s = JSON.stringify;
async function load_node({
  request,
  options: options2,
  state,
  route,
  page: page2,
  node,
  $session,
  context,
  is_leaf,
  is_error,
  status,
  error: error3
}) {
  const { module: module2 } = node;
  let uses_credentials = false;
  const fetched = [];
  let loaded;
  if (module2.load) {
    const load_input = {
      page: page2,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url;
        if (typeof resource === "string") {
          url = resource;
        } else {
          url = resource.url;
          opts = {
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
            ...opts
          };
        }
        if (options2.read && url.startsWith(options2.paths.assets)) {
          url = url.replace(options2.paths.assets, "");
        }
        if (url.startsWith("//")) {
          throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
        }
        let response;
        if (/^[a-zA-Z]+:/.test(url)) {
          response = await (void 0)(url, opts);
        } else {
          const [path, search] = url.split("?");
          const resolved = resolve(request.path, path);
          const filename = resolved.slice(1);
          const filename_html = `${filename}/index.html`;
          const asset = options2.manifest.assets.find((d2) => d2.file === filename || d2.file === filename_html);
          if (asset) {
            if (options2.read) {
              response = new (void 0)(options2.read(asset.file), {
                headers: {
                  "content-type": asset.type
                }
              });
            } else {
              response = await (void 0)(`http://${page2.host}/${asset.file}`, opts);
            }
          }
          if (!response) {
            const headers = { ...opts.headers };
            if (opts.credentials !== "omit") {
              uses_credentials = true;
              headers.cookie = request.headers.cookie;
              if (!headers.authorization) {
                headers.authorization = request.headers.authorization;
              }
            }
            if (opts.body && typeof opts.body !== "string") {
              throw new Error("Request body must be a string");
            }
            const rendered = await respond({
              host: request.host,
              method: opts.method || "GET",
              headers,
              path: resolved,
              rawBody: opts.body,
              query: new URLSearchParams(search)
            }, options2, {
              fetched: url,
              initiator: route
            });
            if (rendered) {
              if (state.prerender) {
                state.prerender.dependencies.set(resolved, rendered);
              }
              response = new (void 0)(rendered.body, {
                status: rendered.status,
                headers: rendered.headers
              });
            }
          }
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 !== "etag" && key2 !== "set-cookie")
                    headers[key2] = value;
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":${escape(body)}}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new (void 0)("Not found", {
          status: 404
        });
      },
      context: { ...context }
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error3;
    }
    loaded = await module2.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  return {
    node,
    loaded: normalize(loaded),
    context: loaded.context || context,
    fetched,
    uses_credentials
  };
}
var escaped = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escape(str) {
  let result = '"';
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped) {
      result += escaped[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += `\\u${code.toString(16).toUpperCase()}`;
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error3 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page2 = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page: page2,
    node: default_layout,
    $session,
    context: {},
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page: page2,
      node: default_error,
      $session,
      context: loaded.context,
      is_leaf: false,
      is_error: true,
      status,
      error: error3
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error3,
      branch,
      page: page2
    });
  } catch (error4) {
    options2.handle_error(error4);
    return {
      status: 500,
      headers: {},
      body: error4.stack
    };
  }
}
async function respond$1({ request, options: options2, state, $session, route }) {
  const match = route.pattern.exec(request.path);
  const params = route.params(match);
  const page2 = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id && options2.load_component(id)));
  } catch (error4) {
    options2.handle_error(error4);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error4
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  const page_config = {
    ssr: "ssr" in leaf ? leaf.ssr : options2.ssr,
    router: "router" in leaf ? leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? leaf.hydrate : options2.hydrate
  };
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {},
      body: null
    };
  }
  let branch;
  let status = 200;
  let error3;
  ssr:
    if (page_config.ssr) {
      let context = {};
      branch = [];
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              request,
              options: options2,
              state,
              route,
              page: page2,
              node,
              $session,
              context,
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            if (loaded.loaded.redirect) {
              return {
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              };
            }
            if (loaded.loaded.error) {
              ({ status, error: error3 } = loaded.loaded);
            }
          } catch (e) {
            options2.handle_error(e);
            status = 500;
            error3 = e;
          }
          if (error3) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let error_loaded;
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  error_loaded = await load_node({
                    request,
                    options: options2,
                    state,
                    route,
                    page: page2,
                    node: error_node,
                    $session,
                    context: node_loaded.context,
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error3
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (e) {
                  options2.handle_error(e);
                  continue;
                }
              }
            }
            return await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error3
            });
          }
        }
        branch.push(loaded);
        if (loaded && loaded.loaded.context) {
          context = {
            ...context,
            ...loaded.loaded.context
          };
        }
      }
    }
  try {
    return await render_response({
      options: options2,
      $session,
      page_config,
      status,
      error: error3,
      branch: branch && branch.filter(Boolean),
      page: page2
    });
  } catch (error4) {
    options2.handle_error(error4);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error4
    });
  }
}
async function render_page(request, route, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const $session = await options2.hooks.getSession(request);
  if (route) {
    const response = await respond$1({
      request,
      options: options2,
      state,
      $session,
      route
    });
    if (response) {
      return response;
    }
    if (state.fetched) {
      return {
        status: 500,
        headers: {},
        body: `Bad request in load function: failed to fetch ${state.fetched}`
      };
    }
  } else {
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 404,
      error: new Error(`Not found: ${request.path}`)
    });
  }
}
function lowercase_keys(obj) {
  const clone2 = {};
  for (const key in obj) {
    clone2[key.toLowerCase()] = obj[key];
  }
  return clone2;
}
function error(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
async function render_route(request, route) {
  const mod = await route.load();
  const handler2 = mod[request.method.toLowerCase().replace("delete", "del")];
  if (handler2) {
    const match = route.pattern.exec(request.path);
    const params = route.params(match);
    const response = await handler2({ ...request, params });
    if (response) {
      if (typeof response !== "object") {
        return error(`Invalid response from route ${request.path}: expected an object, got ${typeof response}`);
      }
      let { status = 200, body, headers = {} } = response;
      headers = lowercase_keys(headers);
      const type = headers["content-type"];
      if (type === "application/octet-stream" && !(body instanceof Uint8Array)) {
        return error(`Invalid response from route ${request.path}: body must be an instance of Uint8Array if content type is application/octet-stream`);
      }
      if (body instanceof Uint8Array && type !== "application/octet-stream") {
        return error(`Invalid response from route ${request.path}: Uint8Array body must be accompanied by content-type: application/octet-stream header`);
      }
      let normalized_body;
      if (typeof body === "object" && (!type || type === "application/json")) {
        headers = { ...headers, "content-type": "application/json" };
        normalized_body = JSON.stringify(body);
      } else {
        normalized_body = body;
      }
      return { status, body: normalized_body, headers };
    }
  }
}
function read_only_form_data() {
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        map.get(key).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
var ReadOnlyFormData = class {
  #map;
  constructor(map) {
    this.#map = map;
  }
  get(key) {
    const value = this.#map.get(key);
    return value && value[0];
  }
  getAll(key) {
    return this.#map.get(key);
  }
  has(key) {
    return this.#map.has(key);
  }
  *[Symbol.iterator]() {
    for (const [key, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *entries() {
    for (const [key, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *keys() {
    for (const [key, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield key;
      }
    }
  }
  *values() {
    for (const [, value] of this.#map) {
      for (let i = 0; i < value.length; i += 1) {
        yield value;
      }
    }
  }
};
function parse_body(raw, headers) {
  if (!raw)
    return raw;
  const [type, ...directives] = headers["content-type"].split(/;\s*/);
  if (typeof raw === "string") {
    switch (type) {
      case "text/plain":
        return raw;
      case "application/json":
        return JSON.parse(raw);
      case "application/x-www-form-urlencoded":
        return get_urlencoded(raw);
      case "multipart/form-data": {
        const boundary = directives.find((directive) => directive.startsWith("boundary="));
        if (!boundary)
          throw new Error("Missing boundary");
        return get_multipart(raw, boundary.slice("boundary=".length));
      }
      default:
        throw new Error(`Invalid Content-Type ${type}`);
    }
  }
  return raw;
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  const nope = () => {
    throw new Error("Malformed form data");
  };
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    nope();
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          nope();
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      nope();
    append(key, body);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !incoming.path.split("/").pop().includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: encodeURI(path + (q ? `?${q}` : ""))
        }
      };
    }
  }
  try {
    const headers = lowercase_keys(incoming.headers);
    return await options2.hooks.handle({
      request: {
        ...incoming,
        headers,
        body: parse_body(incoming.rawBody, headers),
        params: null,
        locals: {}
      },
      resolve: async (request) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            error: null,
            branch: [],
            page: null
          });
        }
        for (const route of options2.manifest.routes) {
          if (!route.pattern.test(request.path))
            continue;
          const response = route.type === "endpoint" ? await render_route(request, route) : await render_page(request, route, options2, state);
          if (response) {
            if (response.status === 200) {
              if (!/(no-store|immutable)/.test(response.headers["cache-control"])) {
                const etag = `"${hash(response.body)}"`;
                if (request.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {},
                    body: null
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        return await render_page(request, null, options2, state);
      }
    });
  } catch (e) {
    options2.handle_error(e);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}

// node_modules/svelte/internal/index.mjs
function noop2() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal2(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function is_empty(obj) {
  return Object.keys(obj).length === 0;
}
function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop2;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
var tasks = new Set();
var active_docs = new Set();
var current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function onMount(fn) {
  get_current_component().$$.on_mount.push(fn);
}
function afterUpdate(fn) {
  get_current_component().$$.after_update.push(fn);
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
function getContext(key) {
  return get_current_component().$$.context.get(key);
}
var resolved_promise = Promise.resolve();
var seen_callbacks = new Set();
var outroing = new Set();
var globals = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : global;
var boolean_attributes = new Set([
  "allowfullscreen",
  "allowpaymentrequest",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "ismap",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected"
]);
var escaped2 = {
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function escape2(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped2[match]);
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
var missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
var on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(parent_component ? parent_component.$$.context : context || []),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css2) => css2.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape2(value)) : `"${value}"`}`}`;
}
function destroy_component(component, detaching) {
  const $$ = component.$$;
  if ($$.fragment !== null) {
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching);
    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}
var SvelteElement;
if (typeof HTMLElement === "function") {
  SvelteElement = class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }
    connectedCallback() {
      const { on_mount } = this.$$;
      this.$$.on_disconnect = on_mount.map(run).filter(is_function);
      for (const key in this.$$.slotted) {
        this.appendChild(this.$$.slotted[key]);
      }
    }
    attributeChangedCallback(attr, _oldValue, newValue) {
      this[attr] = newValue;
    }
    disconnectedCallback() {
      run_all(this.$$.on_disconnect);
    }
    $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop2;
    }
    $on(type, callback) {
      const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return () => {
        const index2 = callbacks.indexOf(callback);
        if (index2 !== -1)
          callbacks.splice(index2, 1);
      };
    }
    $set($$props) {
      if (this.$$set && !is_empty($$props)) {
        this.$$.skip_bound = true;
        this.$$set($$props);
        this.$$.skip_bound = false;
      }
    }
  };
}

// node_modules/svelte/store/index.mjs
var subscriber_queue2 = [];
function writable2(value, start = noop2) {
  let stop;
  const subscribers = [];
  function set(new_value) {
    if (safe_not_equal2(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue2.length;
        for (let i = 0; i < subscribers.length; i += 1) {
          const s2 = subscribers[i];
          s2[1]();
          subscriber_queue2.push(s2, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue2.length; i += 2) {
            subscriber_queue2[i][0](subscriber_queue2[i + 1]);
          }
          subscriber_queue2.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop2) {
    const subscriber = [run2, invalidate];
    subscribers.push(subscriber);
    if (subscribers.length === 1) {
      stop = start(set) || noop2;
    }
    run2(value);
    return () => {
      const index2 = subscribers.indexOf(subscriber);
      if (index2 !== -1) {
        subscribers.splice(index2, 1);
      }
      if (subscribers.length === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}

// .svelte-kit/output/server/app.js
var css$8 = {
  code: "#svelte-announcer.svelte-1j55zn5{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
  map: `{"version":3,"file":"root.svelte","sources":["root.svelte"],"sourcesContent":["<!-- This file is generated by @sveltejs/kit \u2014 do not edit it! -->\\n<script>\\n\\timport { setContext, afterUpdate, onMount } from 'svelte';\\n\\n\\t// stores\\n\\texport let stores;\\n\\texport let page;\\n\\n\\texport let components;\\n\\texport let props_0 = null;\\n\\texport let props_1 = null;\\n\\texport let props_2 = null;\\n\\n\\tsetContext('__svelte__', stores);\\n\\n\\t$: stores.page.set(page);\\n\\tafterUpdate(stores.page.notify);\\n\\n\\tlet mounted = false;\\n\\tlet navigated = false;\\n\\tlet title = null;\\n\\n\\tonMount(() => {\\n\\t\\tconst unsubscribe = stores.page.subscribe(() => {\\n\\t\\t\\tif (mounted) {\\n\\t\\t\\t\\tnavigated = true;\\n\\t\\t\\t\\ttitle = document.title || 'untitled page';\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tmounted = true;\\n\\t\\treturn unsubscribe;\\n\\t});\\n<\/script>\\n\\n<svelte:component this={components[0]} {...(props_0 || {})}>\\n\\t{#if components[1]}\\n\\t\\t<svelte:component this={components[1]} {...(props_1 || {})}>\\n\\t\\t\\t{#if components[2]}\\n\\t\\t\\t\\t<svelte:component this={components[2]} {...(props_2 || {})}/>\\n\\t\\t\\t{/if}\\n\\t\\t</svelte:component>\\n\\t{/if}\\n</svelte:component>\\n\\n{#if mounted}\\n\\t<div id=\\"svelte-announcer\\" aria-live=\\"assertive\\" aria-atomic=\\"true\\">\\n\\t\\t{#if navigated}\\n\\t\\t\\t{title}\\n\\t\\t{/if}\\n\\t</div>\\n{/if}\\n\\n<style>\\n\\t#svelte-announcer {\\n\\t\\tposition: absolute;\\n\\t\\tleft: 0;\\n\\t\\ttop: 0;\\n\\t\\tclip: rect(0 0 0 0);\\n\\t\\tclip-path: inset(50%);\\n\\t\\toverflow: hidden;\\n\\t\\twhite-space: nowrap;\\n\\t\\twidth: 1px;\\n\\t\\theight: 1px;\\n\\t}\\n</style>"],"names":[],"mappings":"AAsDC,iBAAiB,eAAC,CAAC,AAClB,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CACnB,SAAS,CAAE,MAAM,GAAG,CAAC,CACrB,QAAQ,CAAE,MAAM,CAChB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,AACZ,CAAC"}`
};
var Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page: page2 } = $$props;
  let { components } = $$props;
  let { props_0 = null } = $$props;
  let { props_1 = null } = $$props;
  let { props_2 = null } = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  let mounted = false;
  let navigated = false;
  let title = null;
  onMount(() => {
    const unsubscribe = stores.page.subscribe(() => {
      if (mounted) {
        navigated = true;
        title = document.title || "untitled page";
      }
    });
    mounted = true;
    return unsubscribe;
  });
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page2 !== void 0)
    $$bindings.page(page2);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
    $$bindings.props_2(props_2);
  $$result.css.add(css$8);
  {
    stores.page.set(page2);
  }
  return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
    default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
      default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {})}` : ``}`
    })}` : ``}`
  })}

${mounted ? `<div id="${"svelte-announcer"}" aria-live="${"assertive"}" aria-atomic="${"true"}" class="${"svelte-1j55zn5"}">${navigated ? `${escape2(title)}` : ``}</div>` : ``}`;
});
function set_paths(paths) {
}
function set_prerendering(value) {
}
var user_hooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module"
});
var template = ({ head, body }) => '<!DOCTYPE html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<link rel="preload" as="style" href="global.css?ver=1.0" />\n		<link rel="stylesheet" href="global.css?ver=1.0" />\n    <link rel="manifest" href="manifest.json" crossorigin="use-credentials" />\n    <link rel="icon" type="image/png" href="images/favicon.png" />\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n		' + head + '\n	</head>\n	<body>\n		<div id="svelte">' + body + "</div>\n	</body>\n</html>\n";
var options = null;
function init(settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: "/./_app/start-f7f3fcc0.js",
      css: ["/./_app/assets/start-a8cd1609.css"],
      js: ["/./_app/start-f7f3fcc0.js", "/./_app/chunks/vendor-80e94c3a.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => "/./_app/" + entry_lookup[id],
    get_stack: (error22) => String(error22),
    handle_error: (error22) => {
      console.error(error22.stack);
      error22.stack = options.get_stack(error22);
    },
    hooks: get_hooks(user_hooks),
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    read: settings.read,
    root: Root,
    router: true,
    ssr: true,
    target: "#svelte",
    template,
    trailing_slash: "never"
  };
}
var d = decodeURIComponent;
var empty = () => ({});
var manifest = {
  assets: [{ "file": "fonts/Blanka-Regular.otf", "size": 9664, "type": "font/otf" }, { "file": "fonts/Swansea-q3pd.ttf", "size": 53884, "type": "font/ttf" }, { "file": "fonts/gilroy-extrabold.otf", "size": 54956, "type": "font/otf" }, { "file": "global.css", "size": 1123, "type": "text/css" }, { "file": "icons/email-icon.svg", "size": 498, "type": "image/svg+xml" }, { "file": "icons/github-icon.svg", "size": 815, "type": "image/svg+xml" }, { "file": "icons/linkedin-icon.svg", "size": 554, "type": "image/svg+xml" }, { "file": "icons/twitter-icon.svg", "size": 901, "type": "image/svg+xml" }, { "file": "images/favicon.png", "size": 938, "type": "image/png" }, { "file": "manifest.json", "size": 163, "type": "application/json" }, { "file": "styles/dark-mode.css", "size": 190, "type": "text/css" }, { "file": "styles/light-mode.css", "size": 187, "type": "text/css" }, { "file": "uploads/basic-card-style.svg", "size": 705101, "type": "image/svg+xml" }, { "file": "uploads/can-i-use-flexbox.png", "size": 321725, "type": "image/png" }, { "file": "uploads/can-i-use-grid.png", "size": 320161, "type": "image/png" }, { "file": "uploads/layout.png", "size": 39828, "type": "image/png" }],
  layout: "src/routes/__layout.svelte",
  error: ".svelte-kit/build/components/error.svelte",
  routes: [
    {
      type: "page",
      pattern: /^\/$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/about\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/about.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "endpoint",
      pattern: /^\/blog\.json$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return index_json;
      })
    },
    {
      type: "page",
      pattern: /^\/blog\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/blog/index.svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/blog\/relearn-css-pt-1\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/blog/relearn-css-pt-1.md"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/blog\/relearn-css-pt-2\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/blog/relearn-css-pt-2.md"],
      b: [".svelte-kit/build/components/error.svelte"]
    },
    {
      type: "endpoint",
      pattern: /^\/blog\/([^/]+?)\.json$/,
      params: (m) => ({ slug: d(m[1]) }),
      load: () => Promise.resolve().then(function() {
        return _slug__json;
      })
    },
    {
      type: "page",
      pattern: /^\/blog\/([^/]+?)\/?$/,
      params: (m) => ({ slug: d(m[1]) }),
      a: ["src/routes/__layout.svelte", "src/routes/blog/[slug].svelte"],
      b: [".svelte-kit/build/components/error.svelte"]
    }
  ]
};
var get_hooks = (hooks) => ({
  getSession: hooks.getSession || (() => ({})),
  handle: hooks.handle || (({ request, resolve: resolve2 }) => resolve2(request))
});
var module_lookup = {
  "src/routes/__layout.svelte": () => Promise.resolve().then(function() {
    return __layout;
  }),
  ".svelte-kit/build/components/error.svelte": () => Promise.resolve().then(function() {
    return error2;
  }),
  "src/routes/index.svelte": () => Promise.resolve().then(function() {
    return index$1;
  }),
  "src/routes/about.svelte": () => Promise.resolve().then(function() {
    return about;
  }),
  "src/routes/blog/index.svelte": () => Promise.resolve().then(function() {
    return index;
  }),
  "src/routes/blog/relearn-css-pt-1.md": () => Promise.resolve().then(function() {
    return relearnCssPt1;
  }),
  "src/routes/blog/relearn-css-pt-2.md": () => Promise.resolve().then(function() {
    return relearnCssPt2;
  }),
  "src/routes/blog/[slug].svelte": () => Promise.resolve().then(function() {
    return _slug_;
  })
};
var metadata_lookup = { "src/routes/__layout.svelte": { "entry": "/./_app/pages/__layout.svelte-e679f211.js", "css": ["/./_app/assets/pages/__layout.svelte-aa3b5abc.css"], "js": ["/./_app/pages/__layout.svelte-e679f211.js", "/./_app/chunks/vendor-80e94c3a.js"], "styles": null }, ".svelte-kit/build/components/error.svelte": { "entry": "/./_app/error.svelte-3c978d6d.js", "css": [], "js": ["/./_app/error.svelte-3c978d6d.js", "/./_app/chunks/vendor-80e94c3a.js"], "styles": null }, "src/routes/index.svelte": { "entry": "/./_app/pages/index.svelte-722bf508.js", "css": ["/./_app/assets/pages/index.svelte-5a69199e.css"], "js": ["/./_app/pages/index.svelte-722bf508.js", "/./_app/chunks/vendor-80e94c3a.js"], "styles": null }, "src/routes/about.svelte": { "entry": "/./_app/pages/about.svelte-0b2ed5ea.js", "css": ["/./_app/assets/pages/about.svelte-84e910ab.css"], "js": ["/./_app/pages/about.svelte-0b2ed5ea.js", "/./_app/chunks/vendor-80e94c3a.js"], "styles": null }, "src/routes/blog/index.svelte": { "entry": "/./_app/pages/blog/index.svelte-37d3e1ce.js", "css": ["/./_app/assets/pages/blog/index.svelte-d6c6a5c9.css"], "js": ["/./_app/pages/blog/index.svelte-37d3e1ce.js", "/./_app/chunks/vendor-80e94c3a.js"], "styles": null }, "src/routes/blog/relearn-css-pt-1.md": { "entry": "/./_app/pages/blog/relearn-css-pt-1.md-8de473e9.js", "css": [], "js": ["/./_app/pages/blog/relearn-css-pt-1.md-8de473e9.js", "/./_app/chunks/vendor-80e94c3a.js"], "styles": null }, "src/routes/blog/relearn-css-pt-2.md": { "entry": "/./_app/pages/blog/relearn-css-pt-2.md-87511ef3.js", "css": [], "js": ["/./_app/pages/blog/relearn-css-pt-2.md-87511ef3.js", "/./_app/chunks/vendor-80e94c3a.js"], "styles": null }, "src/routes/blog/[slug].svelte": { "entry": "/./_app/pages/blog/[slug].svelte-9ee05d2b.js", "css": ["/./_app/assets/pages/blog/[slug].svelte-2dd94f3b.css"], "js": ["/./_app/pages/blog/[slug].svelte-9ee05d2b.js", "/./_app/chunks/vendor-80e94c3a.js"], "styles": null } };
async function load_component(file) {
  return {
    module: await module_lookup[file](),
    ...metadata_lookup[file]
  };
}
init({ paths: { "base": "", "assets": "/." } });
function render(request, {
  prerender
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options, { prerender });
}
var slugFromPath = (path) => {
  var _a, _b;
  return (_b = (_a = path.match(/([\w-]+)\.(svelte\.md|md|svx)/i)) == null ? void 0 : _a[1]) != null ? _b : null;
};
async function get$1({ query }) {
  var _a;
  const modules = { "./relearn-css-pt-1.md": () => Promise.resolve().then(function() {
    return relearnCssPt1;
  }), "./relearn-css-pt-2.md": () => Promise.resolve().then(function() {
    return relearnCssPt2;
  }) };
  const postPromises = [];
  const limit = Number((_a = query.get("limit")) != null ? _a : Infinity);
  if (Number.isNaN(limit)) {
    return {
      status: 400
    };
  }
  for (const [path, resolver] of Object.entries(modules)) {
    const slug = slugFromPath(path);
    const promise = resolver().then((post) => ({
      slug,
      ...post.metadata
    }));
    postPromises.push(promise);
  }
  const posts = await Promise.all(postPromises);
  const publishedPosts = posts.filter((post) => post.published).slice(0, limit);
  publishedPosts.sort((a, b) => new Date(a.date) > new Date(b.date) ? -1 : 1);
  return {
    body: publishedPosts.slice(0, limit)
  };
}
var index_json = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get: get$1
});
async function get({ params }) {
  const modules = { "./relearn-css-pt-1.md": () => Promise.resolve().then(function() {
    return relearnCssPt1;
  }), "./relearn-css-pt-2.md": () => Promise.resolve().then(function() {
    return relearnCssPt2;
  }) };
  let match;
  for (const [path, resolver] of Object.entries(modules)) {
    if (slugFromPath(path) === params.slug) {
      match = [path, resolver];
      break;
    }
  }
  if (!match) {
    return {
      status: 404
    };
  }
  const post = await match[1]();
  return {
    body: post.metadata
  };
}
var _slug__json = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get
});
var darkMode = writable2("dark");
var getStores = () => {
  const stores = getContext("__svelte__");
  return {
    page: {
      subscribe: stores.page.subscribe
    },
    navigating: {
      subscribe: stores.navigating.subscribe
    },
    get preloading() {
      console.error("stores.preloading is deprecated; use stores.navigating instead");
      return {
        subscribe: stores.navigating.subscribe
      };
    },
    session: stores.session
  };
};
var page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
var css$7 = {
  code: "nav.svelte-1smxs6r.svelte-1smxs6r.svelte-1smxs6r.svelte-1smxs6r{font-weight:300;padding-left:1rem}ul.svelte-1smxs6r.svelte-1smxs6r.svelte-1smxs6r.svelte-1smxs6r{margin:0;padding:0}ul.svelte-1smxs6r.svelte-1smxs6r.svelte-1smxs6r.svelte-1smxs6r::after{content:'';display:block;clear:both}li.svelte-1smxs6r.svelte-1smxs6r.svelte-1smxs6r.svelte-1smxs6r{display:block;float:left}a.svelte-1smxs6r.svelte-1smxs6r.svelte-1smxs6r.svelte-1smxs6r{position:relative;display:inline-block}a.active.svelte-1smxs6r.svelte-1smxs6r.svelte-1smxs6r.svelte-1smxs6r::before{position:absolute;content:'';width:calc(100% - 1em);height:2px;background-color:#7e30a8;display:block;bottom:-1px}a.svelte-1smxs6r.svelte-1smxs6r.svelte-1smxs6r.svelte-1smxs6r{text-decoration:none;padding:0.5em 0.5em;display:block;font-size:1.2em}.right.svelte-1smxs6r.svelte-1smxs6r.svelte-1smxs6r.svelte-1smxs6r{float:right}.switch.svelte-1smxs6r input.svelte-1smxs6r.svelte-1smxs6r.svelte-1smxs6r{-ms-filter:'progid:DXImageTransform.Microsoft.Alpha(Opacity=0)';-moz-opacity:0;opacity:0;z-index:100;position:absolute;width:100%;height:100%;cursor:pointer}.switch.svelte-1smxs6r.svelte-1smxs6r.svelte-1smxs6r.svelte-1smxs6r{width:80px;height:30px;position:relative;margin-right:2rem;display:flex;align-items:center}.switch.svelte-1smxs6r label.svelte-1smxs6r.svelte-1smxs6r.svelte-1smxs6r{display:block;width:80%;height:100%;position:relative;background:linear-gradient(#3f3c3c, #161d2b);border-radius:30px 30px 30px 30px;box-shadow:inset 0 3px 8px 1px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(0, 0, 0, 0.5),\n			0 1px 0 rgba(255, 255, 255, 0.2);-webkit-transition:all 0.5s ease;transition:all 0.5s ease}.switch.svelte-1smxs6r input~label i.svelte-1smxs6r.svelte-1smxs6r.svelte-1smxs6r{display:block;height:26px;width:26px;position:absolute;left:2px;top:2px;z-index:2;border-radius:inherit;background:#283446;background:linear-gradient(#3f3c3c, #283446);box-shadow:inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 8px rgba(0, 0, 0, 0.3),\n			0 12px 12px rgba(0, 0, 0, 0.4);-webkit-transition:all 0.5s ease;transition:all 0.5s ease}.switch.svelte-1smxs6r label.svelte-1smxs6r+span.svelte-1smxs6r.svelte-1smxs6r{content:'';margin-left:6px;width:16px;height:16px;border-radius:8px;background:#283446;background:gradient-gradient(#3f3c3c, #283446);box-shadow:inset 0 1px 0 rgba(0, 0, 0, 0.2), 0 1px 0 rgba(255, 255, 255, 0.1),\n			0 0 10px rgba(185, 231, 253, 0), inset 0 0 8px rgba(0, 0, 0, 0.9),\n			inset 0 -2px 5px rgba(0, 0, 0, 0.3), inset 0 -5px 5px rgba(0, 0, 0, 0.5);-webkit-transition:all 0.5s ease;transition:all 0.5s ease;z-index:2}.switch.svelte-1smxs6r input.svelte-1smxs6r:checked~label.svelte-1smxs6r+span.svelte-1smxs6r{content:'';margin-left:6px;width:16px;height:16px;border-radius:8px;-webkit-transition:all 0.5s ease;transition:all 0.5s ease;z-index:2;background:#b9f3fe;background:gradient-gradient(#ffffff, #77a1b9);box-shadow:inset 0 1px 0 rgba(0, 0, 0, 0.1), 0 1px 0 rgba(255, 255, 255, 0.1),\n			0 0 10px rgba(100, 231, 253, 1), inset 0 0 8px rgba(61, 157, 247, 0.8),\n			inset 0 -2px 5px rgba(185, 231, 253, 0.3), inset 0 -3px 8px rgba(185, 231, 253, 0.5)}.switch.svelte-1smxs6r input:checked~label i.svelte-1smxs6r.svelte-1smxs6r.svelte-1smxs6r{left:auto;left:63%;box-shadow:inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 8px rgba(0, 0, 0, 0.3),\n			0 8px 8px rgba(0, 0, 0, 0.3), inset -1px 0 1px #b9f3fe;-webkit-transition:all 0.5s ease;transition:all 0.5s ease}",
  map: `{"version":3,"file":"Nav.svelte","sources":["Nav.svelte"],"sourcesContent":["<script>\\n\\timport { page } from '$app/stores';\\n\\timport { darkMode } from '../stores/stores';\\n\\n\\tfunction toggleDarkMode() {\\n\\t\\tdarkMode.update((mode) => (mode === 'dark' ? 'light' : 'dark'));\\n\\t}\\n<\/script>\\n\\n<nav>\\n\\t<ul>\\n\\t\\t<li>\\n\\t\\t\\t<a class:active={$page.path === '/'} sveltekit:prefetch class=\\"nav-link\\" href=\\"/\\">home</a>\\n\\t\\t</li>\\n\\t\\t<li>\\n\\t\\t\\t<a class:active={$page.path === '/about'} sveltekit:prefetch class=\\"nav-link\\" href=\\"/about\\"\\n\\t\\t\\t\\t>about</a\\n\\t\\t\\t>\\n\\t\\t</li>\\n\\t\\t<li>\\n\\t\\t\\t<a\\n\\t\\t\\t\\tclass:active={$page.path === '/blog'}\\n\\t\\t\\t\\tsveltekit:prefetch\\n\\t\\t\\t\\tclass=\\"nav-link\\"\\n\\t\\t\\t\\trel=\\"prefetch\\"\\n\\t\\t\\t\\thref=\\"/blog\\">blog</a\\n\\t\\t\\t>\\n\\t\\t</li>\\n\\n\\t\\t<li class=\\"right\\">\\n\\t\\t\\t<div class=\\"switch\\" on:change={toggleDarkMode}>\\n\\t\\t\\t\\t<input type=\\"checkbox\\" name=\\"dark-mode-toggle\\" id=\\"toggle\\" />\\n\\t\\t\\t\\t<label for=\\"dark-mode-toggle\\">\\n\\t\\t\\t\\t\\t<i />\\n\\t\\t\\t\\t</label>\\n\\t\\t\\t\\t<span />\\n\\t\\t\\t</div>\\n\\t\\t</li>\\n\\t</ul>\\n</nav>\\n\\n<style>\\n\\tnav {\\n\\t\\tfont-weight: 300;\\n\\t\\tpadding-left: 1rem;\\n\\t}\\n\\tul {\\n\\t\\tmargin: 0;\\n\\t\\tpadding: 0;\\n\\t}\\n\\n\\t/* clearfix */\\n\\tul::after {\\n\\t\\tcontent: '';\\n\\t\\tdisplay: block;\\n\\t\\tclear: both;\\n\\t}\\n\\n\\tli {\\n\\t\\tdisplay: block;\\n\\t\\tfloat: left;\\n\\t}\\n\\n\\ta {\\n\\t\\tposition: relative;\\n\\t\\tdisplay: inline-block;\\n\\t}\\n\\n\\ta.active::before {\\n\\t\\tposition: absolute;\\n\\t\\tcontent: '';\\n\\t\\twidth: calc(100% - 1em);\\n\\t\\theight: 2px;\\n\\t\\tbackground-color: #7e30a8;\\n\\t\\tdisplay: block;\\n\\t\\tbottom: -1px;\\n\\t}\\n\\n\\ta {\\n\\t\\ttext-decoration: none;\\n\\t\\tpadding: 0.5em 0.5em;\\n\\t\\tdisplay: block;\\n\\t\\tfont-size: 1.2em;\\n\\t}\\n\\n\\t.right {\\n\\t\\tfloat: right;\\n\\t}\\n\\n\\t/* darkmode switch */\\n\\t.switch input {\\n\\t\\t-ms-filter: 'progid:DXImageTransform.Microsoft.Alpha(Opacity=0)';\\n\\t\\t/* filter: alpha(opacity=0); */\\n\\t\\t-moz-opacity: 0;\\n\\t\\topacity: 0;\\n\\t\\tz-index: 100;\\n\\t\\tposition: absolute;\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t\\tcursor: pointer;\\n\\t}\\n\\n\\t.switch {\\n\\t\\twidth: 80px;\\n\\t\\theight: 30px;\\n\\t\\tposition: relative;\\n\\t\\tmargin-right: 2rem;\\n\\t\\tdisplay: flex;\\n\\t\\talign-items: center;\\n\\t}\\n\\n\\t.switch label {\\n\\t\\tdisplay: block;\\n\\t\\twidth: 80%;\\n\\t\\theight: 100%;\\n\\t\\tposition: relative;\\n\\t\\tbackground: linear-gradient(#3f3c3c, #161d2b);\\n\\t\\tborder-radius: 30px 30px 30px 30px;\\n\\t\\tbox-shadow: inset 0 3px 8px 1px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(0, 0, 0, 0.5),\\n\\t\\t\\t0 1px 0 rgba(255, 255, 255, 0.2);\\n\\t\\t-webkit-transition: all 0.5s ease;\\n\\t\\ttransition: all 0.5s ease;\\n\\t}\\n\\n\\t.switch input ~ label i {\\n\\t\\tdisplay: block;\\n\\t\\theight: 26px;\\n\\t\\twidth: 26px;\\n\\t\\tposition: absolute;\\n\\t\\tleft: 2px;\\n\\t\\ttop: 2px;\\n\\t\\tz-index: 2;\\n\\t\\tborder-radius: inherit;\\n\\t\\tbackground: #283446; /* Fallback */\\n\\t\\tbackground: linear-gradient(#3f3c3c, #283446);\\n\\t\\tbox-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 8px rgba(0, 0, 0, 0.3),\\n\\t\\t\\t0 12px 12px rgba(0, 0, 0, 0.4);\\n\\t\\t-webkit-transition: all 0.5s ease;\\n\\t\\ttransition: all 0.5s ease;\\n\\t}\\n\\n\\t.switch label + span {\\n\\t\\tcontent: '';\\n\\t\\tmargin-left: 6px;\\n\\t\\twidth: 16px;\\n\\t\\theight: 16px;\\n\\t\\tborder-radius: 8px;\\n\\t\\tbackground: #283446;\\n\\t\\tbackground: gradient-gradient(#3f3c3c, #283446);\\n\\t\\tbox-shadow: inset 0 1px 0 rgba(0, 0, 0, 0.2), 0 1px 0 rgba(255, 255, 255, 0.1),\\n\\t\\t\\t0 0 10px rgba(185, 231, 253, 0), inset 0 0 8px rgba(0, 0, 0, 0.9),\\n\\t\\t\\tinset 0 -2px 5px rgba(0, 0, 0, 0.3), inset 0 -5px 5px rgba(0, 0, 0, 0.5);\\n\\t\\t-webkit-transition: all 0.5s ease;\\n\\t\\ttransition: all 0.5s ease;\\n\\t\\tz-index: 2;\\n\\t}\\n\\n\\t/* Toggle */\\n\\n\\t.switch input:checked ~ label + span {\\n\\t\\tcontent: '';\\n\\t\\tmargin-left: 6px;\\n\\t\\twidth: 16px;\\n\\t\\theight: 16px;\\n\\t\\tborder-radius: 8px;\\n\\t\\t-webkit-transition: all 0.5s ease;\\n\\t\\ttransition: all 0.5s ease;\\n\\t\\tz-index: 2;\\n\\t\\tbackground: #b9f3fe;\\n\\t\\tbackground: gradient-gradient(#ffffff, #77a1b9);\\n\\t\\tbox-shadow: inset 0 1px 0 rgba(0, 0, 0, 0.1), 0 1px 0 rgba(255, 255, 255, 0.1),\\n\\t\\t\\t0 0 10px rgba(100, 231, 253, 1), inset 0 0 8px rgba(61, 157, 247, 0.8),\\n\\t\\t\\tinset 0 -2px 5px rgba(185, 231, 253, 0.3), inset 0 -3px 8px rgba(185, 231, 253, 0.5);\\n\\t}\\n\\n\\t.switch input:checked ~ label i {\\n\\t\\tleft: auto;\\n\\t\\tleft: 63%;\\n\\t\\tbox-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 8px rgba(0, 0, 0, 0.3),\\n\\t\\t\\t0 8px 8px rgba(0, 0, 0, 0.3), inset -1px 0 1px #b9f3fe;\\n\\t\\t-webkit-transition: all 0.5s ease;\\n\\t\\ttransition: all 0.5s ease;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AA0CC,GAAG,4DAAC,CAAC,AACJ,WAAW,CAAE,GAAG,CAChB,YAAY,CAAE,IAAI,AACnB,CAAC,AACD,EAAE,4DAAC,CAAC,AACH,MAAM,CAAE,CAAC,CACT,OAAO,CAAE,CAAC,AACX,CAAC,AAGD,8DAAE,OAAO,AAAC,CAAC,AACV,OAAO,CAAE,EAAE,CACX,OAAO,CAAE,KAAK,CACd,KAAK,CAAE,IAAI,AACZ,CAAC,AAED,EAAE,4DAAC,CAAC,AACH,OAAO,CAAE,KAAK,CACd,KAAK,CAAE,IAAI,AACZ,CAAC,AAED,CAAC,4DAAC,CAAC,AACF,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,YAAY,AACtB,CAAC,AAED,CAAC,mEAAO,QAAQ,AAAC,CAAC,AACjB,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,EAAE,CACX,KAAK,CAAE,KAAK,IAAI,CAAC,CAAC,CAAC,GAAG,CAAC,CACvB,MAAM,CAAE,GAAG,CACX,gBAAgB,CAAE,OAAO,CACzB,OAAO,CAAE,KAAK,CACd,MAAM,CAAE,IAAI,AACb,CAAC,AAED,CAAC,4DAAC,CAAC,AACF,eAAe,CAAE,IAAI,CACrB,OAAO,CAAE,KAAK,CAAC,KAAK,CACpB,OAAO,CAAE,KAAK,CACd,SAAS,CAAE,KAAK,AACjB,CAAC,AAED,MAAM,4DAAC,CAAC,AACP,KAAK,CAAE,KAAK,AACb,CAAC,AAGD,sBAAO,CAAC,KAAK,6CAAC,CAAC,AACd,UAAU,CAAE,oDAAoD,CAEhE,YAAY,CAAE,CAAC,CACf,OAAO,CAAE,CAAC,CACV,OAAO,CAAE,GAAG,CACZ,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,MAAM,CAAE,OAAO,AAChB,CAAC,AAED,OAAO,4DAAC,CAAC,AACR,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,QAAQ,CAClB,YAAY,CAAE,IAAI,CAClB,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,AACpB,CAAC,AAED,sBAAO,CAAC,KAAK,6CAAC,CAAC,AACd,OAAO,CAAE,KAAK,CACd,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,QAAQ,CAClB,UAAU,CAAE,gBAAgB,OAAO,CAAC,CAAC,OAAO,CAAC,CAC7C,aAAa,CAAE,IAAI,CAAC,IAAI,CAAC,IAAI,CAAC,IAAI,CAClC,UAAU,CAAE,KAAK,CAAC,CAAC,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC;GACpF,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CACjC,kBAAkB,CAAE,GAAG,CAAC,IAAI,CAAC,IAAI,CACjC,UAAU,CAAE,GAAG,CAAC,IAAI,CAAC,IAAI,AAC1B,CAAC,AAED,sBAAO,CAAC,KAAK,CAAG,KAAK,CAAC,CAAC,6CAAC,CAAC,AACxB,OAAO,CAAE,KAAK,CACd,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,CACX,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,GAAG,CACT,GAAG,CAAE,GAAG,CACR,OAAO,CAAE,CAAC,CACV,aAAa,CAAE,OAAO,CACtB,UAAU,CAAE,OAAO,CACnB,UAAU,CAAE,gBAAgB,OAAO,CAAC,CAAC,OAAO,CAAC,CAC7C,UAAU,CAAE,KAAK,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC;GAC9E,CAAC,CAAC,IAAI,CAAC,IAAI,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAC/B,kBAAkB,CAAE,GAAG,CAAC,IAAI,CAAC,IAAI,CACjC,UAAU,CAAE,GAAG,CAAC,IAAI,CAAC,IAAI,AAC1B,CAAC,AAED,sBAAO,CAAC,oBAAK,CAAG,IAAI,8BAAC,CAAC,AACrB,OAAO,CAAE,EAAE,CACX,WAAW,CAAE,GAAG,CAChB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,aAAa,CAAE,GAAG,CAClB,UAAU,CAAE,OAAO,CACnB,UAAU,CAAE,kBAAkB,OAAO,CAAC,CAAC,OAAO,CAAC,CAC/C,UAAU,CAAE,KAAK,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC;GAC9E,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC;GAClE,KAAK,CAAC,CAAC,CAAC,IAAI,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,IAAI,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CACzE,kBAAkB,CAAE,GAAG,CAAC,IAAI,CAAC,IAAI,CACjC,UAAU,CAAE,GAAG,CAAC,IAAI,CAAC,IAAI,CACzB,OAAO,CAAE,CAAC,AACX,CAAC,AAID,sBAAO,CAAC,oBAAK,QAAQ,CAAG,oBAAK,CAAG,IAAI,eAAC,CAAC,AACrC,OAAO,CAAE,EAAE,CACX,WAAW,CAAE,GAAG,CAChB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,aAAa,CAAE,GAAG,CAClB,kBAAkB,CAAE,GAAG,CAAC,IAAI,CAAC,IAAI,CACjC,UAAU,CAAE,GAAG,CAAC,IAAI,CAAC,IAAI,CACzB,OAAO,CAAE,CAAC,CACV,UAAU,CAAE,OAAO,CACnB,UAAU,CAAE,kBAAkB,OAAO,CAAC,CAAC,OAAO,CAAC,CAC/C,UAAU,CAAE,KAAK,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC;GAC9E,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,KAAK,EAAE,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC;GACvE,KAAK,CAAC,CAAC,CAAC,IAAI,CAAC,GAAG,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,IAAI,CAAC,GAAG,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,AACtF,CAAC,AAED,sBAAO,CAAC,KAAK,QAAQ,CAAG,KAAK,CAAC,CAAC,6CAAC,CAAC,AAChC,IAAI,CAAE,IAAI,CACV,IAAI,CAAE,GAAG,CACT,UAAU,CAAE,KAAK,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC;GAC9E,CAAC,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,KAAK,CAAC,IAAI,CAAC,CAAC,CAAC,GAAG,CAAC,OAAO,CACvD,kBAAkB,CAAE,GAAG,CAAC,IAAI,CAAC,IAAI,CACjC,UAAU,CAAE,GAAG,CAAC,IAAI,CAAC,IAAI,AAC1B,CAAC"}`
};
var Nav = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$result.css.add(css$7);
  $$unsubscribe_page();
  return `<nav class="${"svelte-1smxs6r"}"><ul class="${"svelte-1smxs6r"}"><li class="${"svelte-1smxs6r"}"><a sveltekit:prefetch class="${["nav-link svelte-1smxs6r", $page.path === "/" ? "active" : ""].join(" ").trim()}" href="${"/"}">home</a></li>
		<li class="${"svelte-1smxs6r"}"><a sveltekit:prefetch class="${["nav-link svelte-1smxs6r", $page.path === "/about" ? "active" : ""].join(" ").trim()}" href="${"/about"}">about</a></li>
		<li class="${"svelte-1smxs6r"}"><a sveltekit:prefetch class="${["nav-link svelte-1smxs6r", $page.path === "/blog" ? "active" : ""].join(" ").trim()}" rel="${"prefetch"}" href="${"/blog"}">blog</a></li>

		<li class="${"right svelte-1smxs6r"}"><div class="${"switch svelte-1smxs6r"}"><input type="${"checkbox"}" name="${"dark-mode-toggle"}" id="${"toggle"}" class="${"svelte-1smxs6r"}">
				<label for="${"dark-mode-toggle"}" class="${"svelte-1smxs6r"}"><i class="${"svelte-1smxs6r"}"></i></label>
				<span class="${"svelte-1smxs6r"}"></span></div></li></ul>
</nav>`;
});
var css$6 = {
  code: "ul.svelte-16titf5{margin:0;padding:0}ul.svelte-16titf5::after{content:'';display:flex;flex-direction:row;clear:both}li.svelte-16titf5{display:block;float:right}a.svelte-16titf5{text-decoration:none;padding:1em 0.5em;display:block}#twitter.svelte-16titf5{width:32px;height:32px;-webkit-mask:url(/icons/twitter-icon.svg) no-repeat center;mask:url(/icons/twitter-icon.svg) no-repeat center}#github.svelte-16titf5{width:32px;height:32px;-webkit-mask:url(/icons/github-icon.svg) no-repeat center;mask:url(/icons/github-icon.svg) no-repeat center}#linkedin.svelte-16titf5{width:32px;height:32px;-webkit-mask:url(/icons/linkedin-icon.svg) no-repeat center;mask:url(/icons/linkedin-icon.svg) no-repeat center}#email.svelte-16titf5{width:32px;height:32px;-webkit-mask:url(/icons/email-icon.svg) no-repeat center;mask:url(/icons/email-icon.svg) no-repeat center}",
  map: `{"version":3,"file":"Footer.svelte","sources":["Footer.svelte"],"sourcesContent":["<style>\\n  ul {\\n    margin: 0;\\n    padding: 0;\\n  }\\n\\n  /* clearfix */\\n  ul::after {\\n    content: '';\\n    display: flex;\\n    flex-direction: row;\\n    clear: both;\\n  }\\n\\n  li {\\n    display: block;\\n    float: right;\\n  }\\n\\n  a {\\n    text-decoration: none;\\n    padding: 1em 0.5em;\\n    display: block;\\n  }\\n\\n  #twitter {\\n    width: 32px;\\n    height: 32px;\\n    -webkit-mask: url(/icons/twitter-icon.svg) no-repeat center;\\n    mask: url(/icons/twitter-icon.svg) no-repeat center;\\n  }\\n  #github {\\n    width: 32px;\\n    height: 32px;\\n    -webkit-mask: url(/icons/github-icon.svg) no-repeat center;\\n    mask: url(/icons/github-icon.svg) no-repeat center;\\n  }\\n  #linkedin {\\n    width: 32px;\\n    height: 32px;\\n    -webkit-mask: url(/icons/linkedin-icon.svg) no-repeat center;\\n    mask: url(/icons/linkedin-icon.svg) no-repeat center;\\n  }\\n  #email {\\n    width: 32px;\\n    height: 32px;\\n    -webkit-mask: url(/icons/email-icon.svg) no-repeat center;\\n    mask: url(/icons/email-icon.svg) no-repeat center;\\n  }\\n</style>\\n\\n<footer>\\n  <ul>\\n    <li>\\n      <a href=\\"mailto:josh@joshuaswiss.dev\\">\\n        <div class=\\"footer-icon\\" id=\\"email\\" alt=\\"send me an email!\\" title=\\"send me an email!\\" />\\n      </a>\\n    </li>\\n    <li>\\n      <a href=\\"https://www.linkedin.com/in/joshuaswiss/\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\">\\n        <div\\n          class=\\"footer-icon\\"\\n          id=\\"linkedin\\"\\n          alt=\\"explore my professional experience!\\"\\n          title=\\"explore my professional experience!\\" />\\n      </a>\\n    </li>\\n    <li>\\n      <a href=\\"https://twitter.com/jswiiiss\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\">\\n        <div class=\\"footer-icon\\" id=\\"twitter\\" alt=\\"see what I tweet!\\" title=\\"see what I tweet!\\" />\\n      </a>\\n    </li>\\n    <li>\\n      <a href=\\"https://github.com/jswiss\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\">\\n        <div class=\\"footer-icon\\" id=\\"github\\" alt=\\"check out my repos!\\" title=\\"check out my repos!\\" />\\n      </a>\\n    </li>\\n  </ul>\\n</footer>\\n"],"names":[],"mappings":"AACE,EAAE,eAAC,CAAC,AACF,MAAM,CAAE,CAAC,CACT,OAAO,CAAE,CAAC,AACZ,CAAC,AAGD,iBAAE,OAAO,AAAC,CAAC,AACT,OAAO,CAAE,EAAE,CACX,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,GAAG,CACnB,KAAK,CAAE,IAAI,AACb,CAAC,AAED,EAAE,eAAC,CAAC,AACF,OAAO,CAAE,KAAK,CACd,KAAK,CAAE,KAAK,AACd,CAAC,AAED,CAAC,eAAC,CAAC,AACD,eAAe,CAAE,IAAI,CACrB,OAAO,CAAE,GAAG,CAAC,KAAK,CAClB,OAAO,CAAE,KAAK,AAChB,CAAC,AAED,QAAQ,eAAC,CAAC,AACR,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,YAAY,CAAE,IAAI,uBAAuB,CAAC,CAAC,SAAS,CAAC,MAAM,CAC3D,IAAI,CAAE,IAAI,uBAAuB,CAAC,CAAC,SAAS,CAAC,MAAM,AACrD,CAAC,AACD,OAAO,eAAC,CAAC,AACP,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,YAAY,CAAE,IAAI,sBAAsB,CAAC,CAAC,SAAS,CAAC,MAAM,CAC1D,IAAI,CAAE,IAAI,sBAAsB,CAAC,CAAC,SAAS,CAAC,MAAM,AACpD,CAAC,AACD,SAAS,eAAC,CAAC,AACT,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,YAAY,CAAE,IAAI,wBAAwB,CAAC,CAAC,SAAS,CAAC,MAAM,CAC5D,IAAI,CAAE,IAAI,wBAAwB,CAAC,CAAC,SAAS,CAAC,MAAM,AACtD,CAAC,AACD,MAAM,eAAC,CAAC,AACN,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,YAAY,CAAE,IAAI,qBAAqB,CAAC,CAAC,SAAS,CAAC,MAAM,CACzD,IAAI,CAAE,IAAI,qBAAqB,CAAC,CAAC,SAAS,CAAC,MAAM,AACnD,CAAC"}`
};
var Footer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$6);
  return `<footer><ul class="${"svelte-16titf5"}"><li class="${"svelte-16titf5"}"><a href="${"mailto:josh@joshuaswiss.dev"}" class="${"svelte-16titf5"}"><div class="${"footer-icon svelte-16titf5"}" id="${"email"}" alt="${"send me an email!"}" title="${"send me an email!"}"></div></a></li>
    <li class="${"svelte-16titf5"}"><a href="${"https://www.linkedin.com/in/joshuaswiss/"}" target="${"_blank"}" rel="${"noopener noreferrer"}" class="${"svelte-16titf5"}"><div class="${"footer-icon svelte-16titf5"}" id="${"linkedin"}" alt="${"explore my professional experience!"}" title="${"explore my professional experience!"}"></div></a></li>
    <li class="${"svelte-16titf5"}"><a href="${"https://twitter.com/jswiiiss"}" target="${"_blank"}" rel="${"noopener noreferrer"}" class="${"svelte-16titf5"}"><div class="${"footer-icon svelte-16titf5"}" id="${"twitter"}" alt="${"see what I tweet!"}" title="${"see what I tweet!"}"></div></a></li>
    <li class="${"svelte-16titf5"}"><a href="${"https://github.com/jswiss"}" target="${"_blank"}" rel="${"noopener noreferrer"}" class="${"svelte-16titf5"}"><div class="${"footer-icon svelte-16titf5"}" id="${"github"}" alt="${"check out my repos!"}" title="${"check out my repos!"}"></div></a></li></ul></footer>`;
});
var css$5 = {
  code: "@font-face{font-family:'Swansea';src:url('/fonts/Swansea-q3pd.ttf')}@font-face{font-family:'Gilroy';src:url('/fonts/gilroy-extrabold.otf')}h1.svelte-1dd432s{display:inline;text-align:center;font-size:4rem;font-family:'Gilroy'}main.svelte-1dd432s{display:grid;grid-template-rows:auto 1fr;font-family:'Swansea'}#main-border.svelte-1dd432s{display:flex;flex-direction:column;align-items:center}",
  map: `{"version":3,"file":"__layout.svelte","sources":["__layout.svelte"],"sourcesContent":["<script>\\n\\timport { darkMode } from '$lib/stores/stores';\\n\\timport Nav from '$lib/components/Nav.svelte';\\n\\timport Footer from '$lib/components/Footer.svelte';\\n<\/script>\\n\\n<svelte:head>\\n\\t{#if $darkMode === 'light'}\\n\\t\\t<link rel=\\"stylesheet\\" href=\\"/styles/light-mode.css\\" />\\n\\t{:else if $darkMode === 'dark'}\\n\\t\\t<link rel=\\"stylesheet\\" href=\\"/styles/dark-mode.css\\" />\\n\\t{/if}\\n</svelte:head>\\n\\n<Nav />\\n\\n<main>\\n\\t<h1 class=\\"dark\\">Joshua Swiss</h1>\\n\\t<div id=\\"main-border\\">\\n\\t\\t<slot />\\n\\t</div>\\n</main>\\n\\n<Footer />\\n\\n<style>\\n\\t@font-face {\\n\\t\\tfont-family: 'Swansea';\\n\\t\\tsrc: url('/fonts/Swansea-q3pd.ttf');\\n\\t}\\n\\t@font-face {\\n\\t\\tfont-family: 'Gilroy';\\n\\t\\tsrc: url('/fonts/gilroy-extrabold.otf');\\n\\t}\\n\\th1 {\\n\\t\\tdisplay: inline;\\n\\t\\ttext-align: center;\\n\\t\\tfont-size: 4rem;\\n\\t\\tfont-family: 'Gilroy';\\n\\t}\\n\\tmain {\\n\\t\\tdisplay: grid;\\n\\t\\tgrid-template-rows: auto 1fr;\\n\\t\\tfont-family: 'Swansea';\\n\\t}\\n\\t#main-border {\\n\\t\\tdisplay: flex;\\n\\t\\tflex-direction: column;\\n\\t\\talign-items: center;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AA0BC,UAAU,AAAC,CAAC,AACX,WAAW,CAAE,SAAS,CACtB,GAAG,CAAE,IAAI,yBAAyB,CAAC,AACpC,CAAC,AACD,UAAU,AAAC,CAAC,AACX,WAAW,CAAE,QAAQ,CACrB,GAAG,CAAE,IAAI,6BAA6B,CAAC,AACxC,CAAC,AACD,EAAE,eAAC,CAAC,AACH,OAAO,CAAE,MAAM,CACf,UAAU,CAAE,MAAM,CAClB,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,QAAQ,AACtB,CAAC,AACD,IAAI,eAAC,CAAC,AACL,OAAO,CAAE,IAAI,CACb,kBAAkB,CAAE,IAAI,CAAC,GAAG,CAC5B,WAAW,CAAE,SAAS,AACvB,CAAC,AACD,YAAY,eAAC,CAAC,AACb,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,MAAM,AACpB,CAAC"}`
};
var _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $darkMode, $$unsubscribe_darkMode;
  $$unsubscribe_darkMode = subscribe(darkMode, (value) => $darkMode = value);
  $$result.css.add(css$5);
  $$unsubscribe_darkMode();
  return `${$$result.head += `${$darkMode === "light" ? `<link rel="${"stylesheet"}" href="${"/styles/light-mode.css"}" data-svelte="svelte-g204l9">` : `${$darkMode === "dark" ? `<link rel="${"stylesheet"}" href="${"/styles/dark-mode.css"}" data-svelte="svelte-g204l9">` : ``}`}`, ""}

${validate_component(Nav, "Nav").$$render($$result, {}, {}, {})}

<main class="${"svelte-1dd432s"}"><h1 class="${"dark svelte-1dd432s"}">Joshua Swiss</h1>
	<div id="${"main-border"}" class="${"svelte-1dd432s"}">${slots.default ? slots.default({}) : ``}</div></main>

${validate_component(Footer, "Footer").$$render($$result, {}, {}, {})}`;
});
var __layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _layout
});
function load$2({ error: error22, status }) {
  return { props: { error: error22, status } };
}
var Error$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { status } = $$props;
  let { error: error22 } = $$props;
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  if ($$props.error === void 0 && $$bindings.error && error22 !== void 0)
    $$bindings.error(error22);
  return `<h1>${escape2(status)}</h1>

<p>${escape2(error22.message)}</p>


${error22.stack ? `<pre>${escape2(error22.stack)}</pre>` : ``}`;
});
var error2 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Error$1,
  load: load$2
});
var css$4 = {
  code: "section.svelte-yac840{margin-bottom:1rem}p.svelte-yac840{margin:1em auto;font-size:1.3em;text-align:left}",
  map: `{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<style>\\n  section {\\n    margin-bottom: 1rem;\\n  }\\n\\n  p {\\n    margin: 1em auto;\\n    font-size: 1.3em;\\n    text-align: left;\\n  }\\n</style>\\n\\n<svelte:head>\\n  <title>Joshua Swiss's Site</title>\\n  <script src=\\"https://identity.netlify.com/v1/netlify-identity-widget.js\\">\\n\\n  <\/script>\\n</svelte:head>\\n\\n<main id=\\"main\\">\\n  <section>\\n    <p>\\n      Hey there! I'm Josh, a software engineer based in Glasgow. This is my site to showcase my professional skillz\\n      &trade; and blather about whatever I find interesting, whether that be code or anything else.\\n    </p>\\n  </section>\\n  <section>\\n    <p>\\n      If you want to learn more about my work and expertise, please check out the\\n      <a href=\\"about\\">About</a>\\n      page. If you want to read about whatever; JavaScript, Rust, fermentation, running, life, etc., please check out my\\n      <a href=\\"blog\\">Blog</a>\\n      .\\n    </p>\\n  </section>\\n</main>\\n"],"names":[],"mappings":"AACE,OAAO,cAAC,CAAC,AACP,aAAa,CAAE,IAAI,AACrB,CAAC,AAED,CAAC,cAAC,CAAC,AACD,MAAM,CAAE,GAAG,CAAC,IAAI,CAChB,SAAS,CAAE,KAAK,CAChB,UAAU,CAAE,IAAI,AAClB,CAAC"}`
};
var Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$4);
  return `${$$result.head += `${$$result.title = `<title>Joshua Swiss&#39;s Site</title>`, ""}<script src="${"https://identity.netlify.com/v1/netlify-identity-widget.js"}" data-svelte="svelte-9i6u4j"><\/script>`, ""}

<main id="${"main"}"><section class="${"svelte-yac840"}"><p class="${"svelte-yac840"}">Hey there! I&#39;m Josh, a software engineer based in Glasgow. This is my site to showcase my professional skillz
      \u2122 and blather about whatever I find interesting, whether that be code or anything else.
    </p></section>
  <section class="${"svelte-yac840"}"><p class="${"svelte-yac840"}">If you want to learn more about my work and expertise, please check out the
      <a href="${"about"}">About</a>
      page. If you want to read about whatever; JavaScript, Rust, fermentation, running, life, etc., please check out my
      <a href="${"blog"}">Blog</a>
      .
    </p></section></main>`;
});
var index$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes
});
var css$3 = {
  code: "section.svelte-1ow01zy{margin-bottom:1rem}.tldr.svelte-1ow01zy{font-size:1.3rem;font-weight:700;font-style:italic}",
  map: `{"version":3,"file":"about.svelte","sources":["about.svelte"],"sourcesContent":["<svelte:head>\\n\\t<title>About</title>\\n</svelte:head>\\n\\n<main>\\n\\t<section>\\n\\t\\t<p class=\\"tldr\\">\\n\\t\\t\\tTL;DR - I'm a Pittsburgh-born, former humanitarian worker, current software engineer, based in\\n\\t\\t\\tGlasgow, enjoying being in one place after a long nomadic period.\\n\\t\\t</p>\\n\\t</section>\\n\\t<section>\\n\\t\\t<p>\\n\\t\\t\\tHey there, I'm Josh! I'm a Glasgow-based Software Engineer, by way of Kenya, South Sudan,\\n\\t\\t\\tWashington DC, The Gambia, and Pittsburgh. I became a programmer in a bit of a roundabout way:\\n\\t\\t\\tI originally studied Public Policy and wanted to be an urban planner, but the 2008 financial\\n\\t\\t\\tcrisis forced me into the consulting world, which bored me into a drive for adventure in the\\n\\t\\t\\taid and development sector across sub-Saharan Africa. My work increasingly required the use of\\n\\t\\t\\ttechnological tools, and I increasingly wanted to be able to make and adjust the tools myself.\\n\\t\\t\\tI participated in a bootcamp in London in 2015, and have been a software engineer since.\\n\\t\\t</p>\\n\\t\\t<p>\\n\\t\\t\\tBeing a Software Engineer satisfies my drive for always learning new things. While staying on\\n\\t\\t\\ttop of new technologies, trends, and best practices is a challenge, it's definitely a welcome\\n\\t\\t\\tone.\\n\\t\\t</p>\\n\\t</section>\\n\\t<section>\\n\\t\\t<p>\\n\\t\\t\\tI am primarily a JavaScript developer, with most of my time spent on frontend web development.\\n\\t\\t\\tI do a bit of backend stuff too, and even some DevOps, mostly NodeJS/Express, Postgres, and\\n\\t\\t\\tAWS. For the past year I've written JavaScript almost exclusively with Typescript. Aside from\\n\\t\\t\\tSvelte projects where there is not good Typescript support (yet), I plan on only working in\\n\\t\\t\\tTypescript from now on.\\n\\t\\t</p>\\n\\t\\t<p>\\n\\t\\t\\tOver the years I've had the pleasure to work with other languages too; PHP, Ruby, Java, etc.\\n\\t\\t\\tI'm no expert in any of them, but I certainly know enough to navigate an existing code base.\\n\\t\\t</p>\\n\\t\\t<p>\\n\\t\\t\\tI am currently learning and re-learning some languages and frameworks that I write about in my\\n\\t\\t\\t<a href=\\"blog\\">blog,</a>\\n\\t\\t\\tincluding:\\n\\t\\t</p>\\n\\t\\t<ul>\\n\\t\\t\\t<li>Rust;</li>\\n\\t\\t\\t<li>CSS-Grid & Flexbox;</li>\\n\\t\\t\\t<li>Svelte; and</li>\\n\\t\\t\\t<li>Docker.</li>\\n\\t\\t</ul>\\n\\t</section>\\n\\t<section>\\n\\t\\t<p>\\n\\t\\t\\tWhen I'm not writing code I try to get outside and enjoy the Scottish outdoors as much as\\n\\t\\t\\tpossible. I love hiking, running, cycling, and foraging. The weather here is not always\\n\\t\\t\\tconducive to outdoor activities, so when I'm stuck inside I like to cook, ferment/pickle what\\n\\t\\t\\tI've foraged, and read, mostly fiction. I might write about this stuff too \u{1F62C}.\\n\\t\\t</p>\\n\\t</section>\\n\\t<section>\\n\\t\\t<p>\\n\\t\\t\\tIf you want to read about whatever; JavaScript, Rust, fermentation, running, life, etc.,\\n\\t\\t\\tplease check out my\\n\\t\\t\\t<a href=\\"blog\\">blog.</a>\\n\\t\\t</p>\\n\\t</section>\\n</main>\\n\\n<style>\\n\\tsection {\\n\\t\\tmargin-bottom: 1rem;\\n\\t}\\n\\n\\t.tldr {\\n\\t\\tfont-size: 1.3rem;\\n\\t\\tfont-weight: 700;\\n\\t\\tfont-style: italic;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAqEC,OAAO,eAAC,CAAC,AACR,aAAa,CAAE,IAAI,AACpB,CAAC,AAED,KAAK,eAAC,CAAC,AACN,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,GAAG,CAChB,UAAU,CAAE,MAAM,AACnB,CAAC"}`
};
var About = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$3);
  return `${$$result.head += `${$$result.title = `<title>About</title>`, ""}`, ""}

<main><section class="${"svelte-1ow01zy"}"><p class="${"tldr svelte-1ow01zy"}">TL;DR - I&#39;m a Pittsburgh-born, former humanitarian worker, current software engineer, based in
			Glasgow, enjoying being in one place after a long nomadic period.
		</p></section>
	<section class="${"svelte-1ow01zy"}"><p>Hey there, I&#39;m Josh! I&#39;m a Glasgow-based Software Engineer, by way of Kenya, South Sudan,
			Washington DC, The Gambia, and Pittsburgh. I became a programmer in a bit of a roundabout way:
			I originally studied Public Policy and wanted to be an urban planner, but the 2008 financial
			crisis forced me into the consulting world, which bored me into a drive for adventure in the
			aid and development sector across sub-Saharan Africa. My work increasingly required the use of
			technological tools, and I increasingly wanted to be able to make and adjust the tools myself.
			I participated in a bootcamp in London in 2015, and have been a software engineer since.
		</p>
		<p>Being a Software Engineer satisfies my drive for always learning new things. While staying on
			top of new technologies, trends, and best practices is a challenge, it&#39;s definitely a welcome
			one.
		</p></section>
	<section class="${"svelte-1ow01zy"}"><p>I am primarily a JavaScript developer, with most of my time spent on frontend web development.
			I do a bit of backend stuff too, and even some DevOps, mostly NodeJS/Express, Postgres, and
			AWS. For the past year I&#39;ve written JavaScript almost exclusively with Typescript. Aside from
			Svelte projects where there is not good Typescript support (yet), I plan on only working in
			Typescript from now on.
		</p>
		<p>Over the years I&#39;ve had the pleasure to work with other languages too; PHP, Ruby, Java, etc.
			I&#39;m no expert in any of them, but I certainly know enough to navigate an existing code base.
		</p>
		<p>I am currently learning and re-learning some languages and frameworks that I write about in my
			<a href="${"blog"}">blog,</a>
			including:
		</p>
		<ul><li>Rust;</li>
			<li>CSS-Grid &amp; Flexbox;</li>
			<li>Svelte; and</li>
			<li>Docker.</li></ul></section>
	<section class="${"svelte-1ow01zy"}"><p>When I&#39;m not writing code I try to get outside and enjoy the Scottish outdoors as much as
			possible. I love hiking, running, cycling, and foraging. The weather here is not always
			conducive to outdoor activities, so when I&#39;m stuck inside I like to cook, ferment/pickle what
			I&#39;ve foraged, and read, mostly fiction. I might write about this stuff too \u{1F62C}.
		</p></section>
	<section class="${"svelte-1ow01zy"}"><p>If you want to read about whatever; JavaScript, Rust, fermentation, running, life, etc.,
			please check out my
			<a href="${"blog"}">blog.</a></p></section>
</main>`;
});
var about = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": About
});
var css$2 = {
  code: "a.svelte-107r7wm{text-decoration:none}a.svelte-107r7wm:hover{text-decoration:underline}article.svelte-107r7wm{display:flex;flex-direction:column;margin:0.8rem;border:1px solid #7e30a8;border-radius:1%}.title.svelte-107r7wm{margin:0.5rem;font-size:1.5rem}.card-footer.svelte-107r7wm{background-color:#7e30a8}.post-date.svelte-107r7wm{margin:0.5rem;font-size:0.9rem;font-style:italic;color:whitesmoke}",
  map: `{"version":3,"file":"BlogCard.svelte","sources":["BlogCard.svelte"],"sourcesContent":["<script lang=\\"ts\\">export let title;\\nexport let slug;\\nexport let postDate;\\nexport function dateConverter(postDate) {\\n    const convertedPostDate = new Date(postDate);\\n    const dateOptions = {\\n        weekday: 'long',\\n        year: 'numeric',\\n        month: 'long',\\n        day: 'numeric'\\n    };\\n    return convertedPostDate.toLocaleString('en-UK', dateOptions);\\n}\\n<\/script>\\n\\n<article class=\\"blog-card\\">\\n\\t<div class=\\"title\\">\\n\\t\\t<a href=\\"/blog/{slug}\\" rel=\\"prefetch\\">{title}</a>\\n\\t</div>\\n\\t<section class=\\"card-footer\\">\\n\\t\\t<p class=\\"post-date\\">Published: {dateConverter(postDate)}</p>\\n\\t</section>\\n</article>\\n\\n<style>\\n\\ta {\\n\\t\\ttext-decoration: none;\\n\\t}\\n\\n\\ta:hover {\\n\\t\\ttext-decoration: underline;\\n\\t}\\n\\tarticle {\\n\\t\\tdisplay: flex;\\n\\t\\tflex-direction: column;\\n\\t\\tmargin: 0.8rem;\\n\\t\\tborder: 1px solid #7e30a8;\\n\\t\\tborder-radius: 1%;\\n\\t}\\n\\t.title {\\n\\t\\tmargin: 0.5rem;\\n\\t\\tfont-size: 1.5rem;\\n\\t}\\n\\t.card-footer {\\n\\t\\tbackground-color: #7e30a8;\\n\\t}\\n\\t.post-date {\\n\\t\\tmargin: 0.5rem;\\n\\t\\tfont-size: 0.9rem;\\n\\t\\tfont-style: italic;\\n\\t\\tcolor: whitesmoke;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAyBC,CAAC,eAAC,CAAC,AACF,eAAe,CAAE,IAAI,AACtB,CAAC,AAED,gBAAC,MAAM,AAAC,CAAC,AACR,eAAe,CAAE,SAAS,AAC3B,CAAC,AACD,OAAO,eAAC,CAAC,AACR,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,MAAM,CAAE,MAAM,CACd,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,OAAO,CACzB,aAAa,CAAE,EAAE,AAClB,CAAC,AACD,MAAM,eAAC,CAAC,AACP,MAAM,CAAE,MAAM,CACd,SAAS,CAAE,MAAM,AAClB,CAAC,AACD,YAAY,eAAC,CAAC,AACb,gBAAgB,CAAE,OAAO,AAC1B,CAAC,AACD,UAAU,eAAC,CAAC,AACX,MAAM,CAAE,MAAM,CACd,SAAS,CAAE,MAAM,CACjB,UAAU,CAAE,MAAM,CAClB,KAAK,CAAE,UAAU,AAClB,CAAC"}`
};
function dateConverter(postDate) {
  const convertedPostDate = new Date(postDate);
  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  };
  return convertedPostDate.toLocaleString("en-UK", dateOptions);
}
var BlogCard = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { title } = $$props;
  let { slug } = $$props;
  let { postDate } = $$props;
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.slug === void 0 && $$bindings.slug && slug !== void 0)
    $$bindings.slug(slug);
  if ($$props.postDate === void 0 && $$bindings.postDate && postDate !== void 0)
    $$bindings.postDate(postDate);
  if ($$props.dateConverter === void 0 && $$bindings.dateConverter && dateConverter !== void 0)
    $$bindings.dateConverter(dateConverter);
  $$result.css.add(css$2);
  return `<article class="${"blog-card svelte-107r7wm"}"><div class="${"title svelte-107r7wm"}"><a href="${"/blog/" + escape2(slug)}" rel="${"prefetch"}" class="${"svelte-107r7wm"}">${escape2(title)}</a></div>
	<section class="${"card-footer svelte-107r7wm"}"><p class="${"post-date svelte-107r7wm"}">Published: ${escape2(dateConverter(postDate))}</p></section>
</article>`;
});
var css$1 = {
  code: "section.svelte-1qouyyh{display:flex;flex-direction:column;margin:0 0 1em 0;line-height:1.5;list-style-type:none;max-width:60vw}",
  map: '{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script context=\\"module\\" lang=\\"ts\\">var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\\n    return new (P || (P = Promise))(function (resolve, reject) {\\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\\n        function rejected(value) { try { step(generator[\\"throw\\"](value)); } catch (e) { reject(e); } }\\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\\n    });\\n};\\nexport function load({ page, fetch }) {\\n    return __awaiter(this, void 0, void 0, function* () {\\n        // Use a `limit` querystring parameter to fetch a limited number of posts\\n        // e.g. fetch(\'posts.json?limit=5\') for 5 most recent posts\\n        const posts = yield fetch(`${page.path}.json`).then((res) => res.json());\\n        return {\\n            props: {\\n                posts\\n            }\\n        };\\n    });\\n}\\n<\/script>\\n\\n<script lang=\\"ts\\">import BlogCard from \'$lib/components/BlogCard.svelte\';\\nexport let posts;\\n<\/script>\\n\\n<svelte:head>\\n\\t<title>Blog</title>\\n</svelte:head>\\n\\n<section>\\n\\t{#each posts as { slug, title, date }}\\n\\t\\t<BlogCard {title} postDate={date} {slug} />\\n\\t{/each}\\n</section>\\n\\n<style>\\n\\tsection {\\n\\t\\tdisplay: flex;\\n\\t\\tflex-direction: column;\\n\\t\\tmargin: 0 0 1em 0;\\n\\t\\tline-height: 1.5;\\n\\t\\tlist-style-type: none;\\n\\t\\tmax-width: 60vw;\\n\\t}\\n\\n\\tp {\\n\\t\\tmax-width: 60vw;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAsCC,OAAO,eAAC,CAAC,AACR,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CACjB,WAAW,CAAE,GAAG,CAChB,eAAe,CAAE,IAAI,CACrB,SAAS,CAAE,IAAI,AAChB,CAAC"}'
};
var __awaiter$1 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve2) {
      resolve2(value);
    });
  }
  return new (P || (P = Promise))(function(resolve2, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
function load$1({ page: page2, fetch: fetch3 }) {
  return __awaiter$1(this, void 0, void 0, function* () {
    const posts = yield fetch3(`${page2.path}.json`).then((res) => res.json());
    return { props: { posts } };
  });
}
var Blog = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { posts } = $$props;
  if ($$props.posts === void 0 && $$bindings.posts && posts !== void 0)
    $$bindings.posts(posts);
  $$result.css.add(css$1);
  return `${$$result.head += `${$$result.title = `<title>Blog</title>`, ""}`, ""}

<section class="${"svelte-1qouyyh"}">${each(posts, ({ slug, title, date }) => `${validate_component(BlogCard, "BlogCard").$$render($$result, { title, postDate: date, slug }, {}, {})}`)}
</section>`;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Blog,
  load: load$1
});
var metadata$1 = {
  "title": "Re-Learning CSS Part 1: Grid or Flexbox for Layouts?",
  "date": "2020-05-01T16:03:45.390Z",
  "tags": "tutorial, learning, how to, how-to, css, html, web dev, web development, css-grid, grid, flexbox, layout, columns ",
  "published": true
};
var Relearn_css_pt_1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<p><em>TL;DR - CSS Grid and Flexbox are great. I use Grid for layouts and two-dimensional renderings, and Flexbox for one-dimensional renderings and components.</em></p>
<p>CSS is tough. When I started professionally developing websites about five years ago, there was zero incentive to develop CSS knowledge; even basic layouts seemed hacky, with prolific use of <code>float: right;</code> this and <code>margin: 0 auto;</code> that. It didn\u2019t intrinsically make sense and only added to the mystique and inapproachability that was CSS at the time.</p>
<p>Like many other software engineers at the time, I reached for CSS frameworks to solve the problem. I <a href="${"https://getbootstrap.com/"}" rel="${"nofollow"}">Bootstrapped</a>, <a href="${"https://bulma.io/"}" rel="${"nofollow"}">Bulma\u2019ed</a>, and <a href="${"https://material.io/"}" rel="${"nofollow"}">Material Designed</a> my way through a lot of them. Frameworks like these enable teams to develop products quickly and with a degree of uniformity. Professionally, I exclusively used frameworks for a long time, with the occasional tweak here and there in regular CSS. But frameworks are not without downsides: they can add a lot of weight to your package bundle, add complexity to your markup, and are yet another thing to learn.</p>
<p>I had all but resigned myself to working with frameworks forever, until I came across this tweet, in a thread discussing how a lot of folk (like me!) think CSS is a pain:</p>
<blockquote class="${"twitter-tweet"}"><p lang="${"en"}" dir="${"ltr"}">Modern CSS has solved so much of this. Come back to it with a fresh mind removing any remembrance of floats and Internet Explorer.</p>\u2014 Shaw (@shshaw) <a href="${"https://twitter.com/shshaw/status/1248095631077507073?ref_src=twsrc%5Etfw"}">April 9, 2020</a></blockquote> <p>This inspired me. Have I ignored major improvements in CSS? Is it easier now? Does it make more sense? What if <em>I</em> come back to it with a \u2018fresh mind\u2019?</p>
<p>And thus, this blog series was born. I\u2019m going to relearn CSS and write about it along the way. I\u2019ll be looking at layouts, components, \u2018pure-CSS\u2019 images, and animations.</p>
<p>First up, layouts. Specifically, should I build my layout with CSS Grid or Flexbox?</p>
<h3 id="${"grid-or-flexbox"}"><a href="${"#grid-or-flexbox"}">Grid or Flexbox?</a></h3>
<p>According to our good friends at CanIUse (as of 8 May, 2020) both Flexbox and Grid work with the browsers a significant majority of people use.</p>
<p><img src="${"/uploads/can-i-use-grid.png"}" alt="${"Can I Use CSS Grid"}" title="${"Can I Use CSS Grid"}"></p>
<p><em><a href="${"https://caniuse.com/#feat=css-grid"}" rel="${"nofollow"}">Can I use Grid?</a></em></p>
<p><img src="${"/uploads/can-i-use-flexbox.png"}" alt="${"Can I use Flexbox"}" title="${"Can I use Flexbox"}"></p>
<p><em><a href="${"https://caniuse.com/#feat=flexbox"}" rel="${"nofollow"}">Can I use Flexbox?</a></em></p>
<p>While Grid has a bit more red in its image, it still works with the browsers 95% of the population use. For my audience, that works fine. If you need to accommodate for that remaining ~5%, I\u2019d suggest adding appropriate polyfills.</p>
<h3 id="${"building-layouts"}"><a href="${"#building-layouts"}">Building Layouts</a></h3>
<p>Most layouts look something like this:</p>
<p><img src="${"/uploads/layout.png"}" alt="${"A basic layout"}" title="${"A basic layout"}"></p>
<p>I\u2019d hazard a guess that a ridiculous proportion of websites have some form of this basic layout in place, with a header for title/nav/avatar, a footer for contact, external navigation, etc. two sidebars for whatever, and a main section in the middle. This layout is so popular, its been dubbed the <a href="${"https://css-tricks.com/snippets/css/css-grid-starter-layouts/"}" rel="${"nofollow"}">\u2018Holy Grail\u2019 Layout</a> by our pals over at CSS Tricks!</p>
<p>So, let\u2019s build this layout using both CSS Grid and Flexbox!</p>
<p>Here\u2019s the layout using Grid:</p>
<iframe height="${"450"}" style="${"width: 100%;"}" scrolling="${"no"}" title="${"Basic Layout - Grid"}" src="${"https://codepen.io/jswiss/embed/BaorJOo?height=350&theme-id=dark&default-tab=css,result"}" frameborder="${"no"}" allowtransparency="${"true"}" allowfullscreen="${"true"}">See the Pen <a href="${"https://codepen.io/jswiss/pen/BaorJOo"}">Basic Layout - Grid</a> by Joshua Swiss
  (<a href="${"https://codepen.io/jswiss"}">@jswiss</a>) on <a href="${"https://codepen.io"}">CodePen</a>.
</iframe>
<p>Overall, pretty simple! However, there are a few things worth noting, that may not be otherwise obvious:</p>
<ul><li>The element with <code>display: grid;</code> (here a <code>div</code> with the id of grid) sets top-level child elements of that div to exist in a grid display;</li>
<li><code>grid-template-rows</code> and <code>grid-template-columns</code> set up the grid. Here we have a 3x3 grid, with the header and footer set to 50px height, and the left and right sidebars set to 100px width;</li>
<li><code>grid-gap</code> is shorthand for <code>grid-column-gap</code> <em>and</em> <code>grid-row-gap</code>. Here I set both to 1em;</li>
<li>Similarly, <code>grid-column</code> is shorthand for <code>grid-column-start</code> and <code>grid-column-end</code>, where the grid item is not inclusive of the end column. Where I have <code>grid-column: 1 / 4;</code>, it means <code>grid-column-start: 1;, grid-column-end: 4;</code>, which means this grid item spans columns 1, 2, and 3.</li></ul>
<p>Now, let\u2019s check out the same layout, this time using Flexbox:</p>
<iframe height="${"450"}" style="${"width: 100%;"}" scrolling="${"no"}" title="${"Basic Layout - Flexbox"}" src="${"https://codepen.io/jswiss/embed/dyYmdWy?height=350&theme-id=dark&default-tab=css,result"}" frameborder="${"no"}" allowtransparency="${"true"}" allowfullscreen="${"true"}">See the Pen <a href="${"https://codepen.io/jswiss/pen/dyYmdWy"}">Basic Layout - Flexbox</a> by Joshua Swiss
  (<a href="${"https://codepen.io/jswiss"}">@jswiss</a>) on <a href="${"https://codepen.io"}">CodePen</a>.
</iframe>
<p>A little more verbose! I wrapped the second row in a <code>section</code> element so I could have rows inside columns (notice how Flexbox\u2019s rows/columns are the inverse of Grid\u2019s?). Let\u2019s break it down a little:</p>
<ul><li>For the topmost <code>div</code>, I set the display to flex, set a minimum height and width, and set the <code>flex-direction</code> to column. Column here means one column, with multiple rows;</li>
<li>In the <code>#main</code> section, I again set the display to flex, and set <code>flex-direction</code> to row. Row here means one row, with multiple columns. I also gave the section a margin top and bottom of <code>1em</code>;</li>
<li>I gave the header and footer and the asides default height and width; and</li>
<li>I gave the main article a margin left and right of <code>1em</code>, and set it to <code>flex-grow: 1</code>. <code>flex-grow</code> allows the <code>article</code> element to expand to take up the extra space in the <code>flex-row</code> it is in.</li></ul>
<h4 id="${"bonus"}"><a href="${"#bonus"}">BONUS!</a></h4>
<p>Here\u2019s the same layout using Bootstrap!</p>
<iframe height="${"450"}" style="${"width: 100%;"}" scrolling="${"no"}" title="${"Basic Grid - Bootstrap"}" src="${"https://codepen.io/jswiss/embed/xxwWWqO?height=350&theme-id=dark&default-tab=css,result"}" frameborder="${"no"}" allowtransparency="${"true"}" allowfullscreen="${"true"}">See the Pen <a href="${"https://codepen.io/jswiss/pen/xxwWWqO"}">Basic Grid - Bootstrap</a> by Joshua Swiss
  (<a href="${"https://codepen.io/jswiss"}">@jswiss</a>) on <a href="${"https://codepen.io"}">CodePen</a>.
</iframe>
<p>Funnily enough, even though I imported Bootstrap here, I\u2019m <em>still</em> using Flexbox! This is because Bootstrap uses the 12-column grid convention, and I <em>hate</em> it. The 12-column grid layout is a web design convention that, at best, requires you to do some calculations, and at worst, requires you to overuse <a href="${"https://css-tricks.com/magic-numbers-in-css/"}" rel="${"nofollow"}">magic numbers</a>.</p>
<p>I cannot tell you how long I\u2019ve spent fiddling with different configurations of the 12-column layout to get it just right; tweaking \`col-10\` to \`col-8\`, adjusting margins as I go. It\u2019s a waste of time, and you don\u2019t learn anything in the process.</p>
<p>So, if you still need Flexbox to use Bootstrap, why do you need to use Bootstrap. It\u2019s a very good question\u2026</p>
<h3 id="${"which-to-use"}"><a href="${"#which-to-use"}">Which to use?</a></h3>
<p>In the end, I prefer Grid for layouts or anything two-dimensional, and Flexbox for one-dimensional renderings (like the icons in the bottom of my site!) or for components. Of course, that\u2019s personal preference; yours may differ, and mine may change over time!</p>
<p>For me, it is definitely time to rid myself of unnecessary frameworks, wipe the slate clean, and embrace CSS!</p>`;
});
var relearnCssPt1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Relearn_css_pt_1,
  metadata: metadata$1
});
var metadata = {
  "title": "Re-Learning CSS Part 2: Simplify Cards with Flexbox",
  "date": "2020-06-15T16:00:43.796Z",
  "tags": "css, flex, flexbox, css-grid, style, web development, cards, lesson, tutorials, guide",
  "published": true
};
var Relearn_css_pt_2 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<p><em>This is an ongoing series where I am starting over learning modern CSS. You can find other posts in this series below:</em></p>
<ul><li><a href="${"https://joshuaswiss.dev/blog/re-learning-css-part-1-grid-or-flexbox"}" rel="${"nofollow"}">Part 1: CSS Grid or Flexbox for Layouts?</a></li></ul>
<p><em>TL;DR - Styling cards used to be a pain. With Flexbox it\u2019s pretty easy!</em></p>
<p>CSS is tough. When I started professionally developing websites about five years ago, there was zero incentive to develop CSS knowledge; even basic layouts seemed hacky, with prolific use of <code>float: right;</code> this and <code>margin: 0 auto;</code> that. It didn\u2019t intrinsically make sense and only added to the mystique and inapproachability that was CSS at the time.</p>
<p>I often dreaded styling anything beyond minor tweaks. If I had to create a card, for example, I\u2019d reach for <a href="${"https://getbootstrap.com/"}" rel="${"nofollow"}">Bootstrap</a> or <a href="${"https://bulma.io/"}" rel="${"nofollow"}">Bulma</a> or <a href="${"https://getmdl.io/"}" rel="${"nofollow"}">Material Design</a>. But with Flexbox there\u2019s no need! Let\u2019s start with a super simple example.</p>
<h3 id="${"card-1-simple-and-centred"}"><a href="${"#card-1-simple-and-centred"}">Card 1: Simple and centred</a></h3>
<p>Let\u2019s say you want a very basic card that has one piece of child content in it, and that content is centred vertically and horizontally. For the sake of this example, let\u2019s say it\u2019s holiday destinations. Here\u2019s some simple code to get started:</p>
<iframe height="${"450"}" style="${"width: 100%;"}" scrolling="${"no"}" title="${"Simple Centred Card"}" src="${"https://codepen.io/jswiss/embed/LYGRpRo?height=265&theme-id=dark&default-tab=css,result"}" frameborder="${"no"}" allowtransparency="${"true"}" allowfullscreen="${"true"}">See the Pen <a href="${"https://codepen.io/jswiss/pen/LYGRpRo"}">Simple Centred Card</a> by Joshua Swiss
  (<a href="${"https://codepen.io/jswiss"}">@jswiss</a>) on <a href="${"https://codepen.io"}">CodePen</a>.
</iframe>
<p>Each card is an <code>article</code> element. The cards are inside a <code>section</code> element, where I applied some basic Grid styles. The important part for this example is inside the <code>.card</code> class:</p>
<p><img src="${"/uploads/basic-card-style.svg"}" alt="${"Basic Card Flex Styles to Center Vertically and Horizontally"}" title="${"Basic Card Flex Styles to Center Vertically and Horizontally"}"></p>
<p>Flex, like grid, are known as \u2018display-inside\u2019 keywords that can be assigned to the <code>display</code> property. \u2018Display-inside\u2019 keywords change how the element\u2019s inner content is displayed. This is in contrast to \u2018display-outside\u2019 keywords that change the element\u2019s outer display type, or the role the element has in the layout flow. Some \u2018display-outside\u2019 keywords are <code>block</code> or <code>inline</code>.</p>
<p>Within an element where the <code>display: flex;</code> property/keyword is assigned, child elements are centred vertically with <code>align-items: center;</code> and horizontally with <code>justify-content: center;</code>.</p>
<p>While this card layout is pretty simple, it\u2019s not all that useful. Let\u2019s move on to something we could more realistically use.</p>
<h3 id="${"card-2-centred-with-sections"}"><a href="${"#card-2-centred-with-sections"}">Card 2: Centred with sections</a></h3>
<p>Building on the last example; we need a little more for your holiday cards. Just saying the destination name doesn\u2019t really do much. Let\u2019s add a photo, and the date visited:</p>
<iframe height="${"450"}" style="${"width: 100%;"}" scrolling="${"no"}" title="${"Card: Centred with Sections"}" src="${"https://codepen.io/jswiss/embed/ZEQpbNw?height=265&theme-id=dark&default-tab=html,result"}" frameborder="${"no"}" allowtransparency="${"true"}" allowfullscreen="${"true"}">See the Pen <a href="${"https://codepen.io/jswiss/pen/ZEQpbNw"}">Card: Centred with Sections</a> by Joshua Swiss
  (<a href="${"https://codepen.io/jswiss"}">@jswiss</a>) on <a href="${"https://codepen.io"}">CodePen</a>.
</iframe>
<p>Now each card\u2019s content is horizontally centre-aligned, and it has three sections: one for the header, one for the main content (a photo for this example), and one for the footer.</p>
<p>I made some changes to the card\u2019s max and min width and height, and added some basic styles to each section and the img elements, but those changes aren\u2019t that interesting, and you can check them out in the Pen above. The most interesting line of code for this example, at least that relates to Flexbox, is:\\
\\
<code>flex-direction: column;</code></p>
<p>This one line transposes the contents of our three new <code>section</code> elements to display vertically instead of horizontally, similar to the <code>old-school display: block;</code> versus display: <code>inline-block;</code>.</p>
<p>Ok! Our cards are starting to look pretty decent, but I think they could be better. Let\u2019s stick with the three sections we have for each card, but add some extra styling for functionality we might add later.</p>
<h3 id="${"card-3-handling-complex-sections"}"><a href="${"#card-3-handling-complex-sections"}">Card 3: Handling complex sections</a></h3>
<p>The final example has the card\u2019s title and date in the \u2018header\u2019 section aligned to the left, and changes the footer to a \u2018card-action-area\u2019 where there are \u2018open\u2019 and \u2018edit\u2019 buttons.</p>
<iframe height="${"450"}" style="${"width: 100%;"}" scrolling="${"no"}" title="${"Cards with complex sections"}" src="${"https://codepen.io/jswiss/embed/ZEQpWWp?height=611&theme-id=dark&default-tab=css,result"}" frameborder="${"no"}" allowtransparency="${"true"}" allowfullscreen="${"true"}">See the Pen <a href="${"https://codepen.io/jswiss/pen/ZEQpWWp"}">Cards with complex sections</a> by Joshua Swiss
  (<a href="${"https://codepen.io/jswiss"}">@jswiss</a>) on <a href="${"https://codepen.io"}">CodePen</a>.
</iframe>
<p>In the new <code>header</code> element we have a <code>card-title</code> and <code>card-date,</code> each with styles specific to them. The header element has the style <code>align-self: flex-start;</code> applied, which pull the child sections to the beginning (the flex start) of the element.</p>
<p>The new <code>footer</code> element also has two children, <code>open</code> and <code>edit</code> buttons, but we want these to be displayed horizontally rather than vertically. With flex that\u2019s easy! Simply set the <code>card-action-area</code> class to <code>display: flex;</code>, which will apply to all it\u2019s child elements, and reset the <code>flex-direction</code> to its default <code>row</code>!</p>
<h3 id="${"wrapping-up"}"><a href="${"#wrapping-up"}">Wrapping up</a></h3>
<p>Flexbox makes styling components like cards a breeze. It\u2019s powerful and applicable for simple or more complex components. I wish I had it when I started web development!</p>`;
});
var relearnCssPt2 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Relearn_css_pt_2,
  metadata
});
var css = {
  code: "section.svelte-h8zucp pre{background-color:#f9f9f9;box-shadow:inset 1px 1px 5px rgba(0, 0, 0, 0.05);padding:0.5em;border-radius:2px;overflow-x:auto}section.svelte-h8zucp pre code{background-color:transparent;padding:0}section.svelte-h8zucp ul{line-height:1.5}section.svelte-h8zucp li{margin:0 0 0.5em 0}section.svelte-h8zucp img, twitter-widget{max-width:fit-content;height:auto}h2.svelte-h8zucp{margin-bottom:2rem;display:inline;text-align:center;font-size:4rem;font-family:'Gilroy'}",
  map: `{"version":3,"file":"[slug].svelte","sources":["[slug].svelte"],"sourcesContent":["<script context=\\"module\\" lang=\\"ts\\">var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\\n    return new (P || (P = Promise))(function (resolve, reject) {\\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\\n        function rejected(value) { try { step(generator[\\"throw\\"](value)); } catch (e) { reject(e); } }\\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\\n    });\\n};\\nexport function load({ page, fetch }) {\\n    return __awaiter(this, void 0, void 0, function* () {\\n        const post = yield fetch(\`\${page.path}.json\`).then((res) => res.json());\\n        if (!post || !post.published) {\\n            return {\\n                status: 404,\\n                error: new Error('Post could not be found')\\n            };\\n        }\\n        return {\\n            props: {\\n                post\\n            }\\n        };\\n    });\\n}\\n<\/script>\\n\\n<script lang=\\"ts\\">export let post;\\n<\/script>\\n\\n<svelte:head>\\n\\t<title>{post.title}</title>\\n\\t<meta name=\\"keywords\\" content={post.tags} />\\n\\t<meta name=\\"description\\" content={post.summary} />\\n</svelte:head>\\n\\n<h2>{post.title}</h2>\\n\\n<section>\\n\\t<slot />\\n</section>\\n\\n<style>\\n\\tsection :global(pre) {\\n\\t\\tbackground-color: #f9f9f9;\\n\\t\\tbox-shadow: inset 1px 1px 5px rgba(0, 0, 0, 0.05);\\n\\t\\tpadding: 0.5em;\\n\\t\\tborder-radius: 2px;\\n\\t\\toverflow-x: auto;\\n\\t}\\n\\tsection :global(pre) :global(code) {\\n\\t\\tbackground-color: transparent;\\n\\t\\tpadding: 0;\\n\\t}\\n\\tsection :global(ul) {\\n\\t\\tline-height: 1.5;\\n\\t}\\n\\tsection :global(li) {\\n\\t\\tmargin: 0 0 0.5em 0;\\n\\t}\\n\\tsection :global(img, twitter-widget) {\\n\\t\\tmax-width: fit-content;\\n\\t\\theight: auto;\\n\\t}\\n\\th2 {\\n\\t\\tmargin-bottom: 2rem;\\n\\t\\tdisplay: inline;\\n\\t\\ttext-align: center;\\n\\t\\tfont-size: 4rem;\\n\\t\\tfont-family: 'Gilroy';\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AA2CC,qBAAO,CAAC,AAAQ,GAAG,AAAE,CAAC,AACrB,gBAAgB,CAAE,OAAO,CACzB,UAAU,CAAE,KAAK,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CACjD,OAAO,CAAE,KAAK,CACd,aAAa,CAAE,GAAG,CAClB,UAAU,CAAE,IAAI,AACjB,CAAC,AACD,qBAAO,CAAC,AAAQ,GAAG,AAAC,CAAC,AAAQ,IAAI,AAAE,CAAC,AACnC,gBAAgB,CAAE,WAAW,CAC7B,OAAO,CAAE,CAAC,AACX,CAAC,AACD,qBAAO,CAAC,AAAQ,EAAE,AAAE,CAAC,AACpB,WAAW,CAAE,GAAG,AACjB,CAAC,AACD,qBAAO,CAAC,AAAQ,EAAE,AAAE,CAAC,AACpB,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,AACpB,CAAC,AACD,qBAAO,CAAC,AAAQ,mBAAmB,AAAE,CAAC,AACrC,SAAS,CAAE,WAAW,CACtB,MAAM,CAAE,IAAI,AACb,CAAC,AACD,EAAE,cAAC,CAAC,AACH,aAAa,CAAE,IAAI,CACnB,OAAO,CAAE,MAAM,CACf,UAAU,CAAE,MAAM,CAClB,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,QAAQ,AACtB,CAAC"}`
};
var __awaiter = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve2) {
      resolve2(value);
    });
  }
  return new (P || (P = Promise))(function(resolve2, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
function load({ page: page2, fetch: fetch3 }) {
  return __awaiter(this, void 0, void 0, function* () {
    const post = yield fetch3(`${page2.path}.json`).then((res) => res.json());
    if (!post || !post.published) {
      return {
        status: 404,
        error: new Error("Post could not be found")
      };
    }
    return { props: { post } };
  });
}
var U5Bslugu5D = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { post } = $$props;
  if ($$props.post === void 0 && $$bindings.post && post !== void 0)
    $$bindings.post(post);
  $$result.css.add(css);
  return `${$$result.head += `${$$result.title = `<title>${escape2(post.title)}</title>`, ""}<meta name="${"keywords"}"${add_attribute("content", post.tags, 0)} data-svelte="svelte-19wy4af"><meta name="${"description"}"${add_attribute("content", post.summary, 0)} data-svelte="svelte-19wy4af">`, ""}

<h2 class="${"svelte-h8zucp"}">${escape2(post.title)}</h2>

<section class="${"svelte-h8zucp"}">${slots.default ? slots.default({}) : ``}
</section>`;
});
var _slug_ = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": U5Bslugu5D,
  load
});

// .svelte-kit/netlify/entry.js
init();
async function handler(event) {
  const { path, httpMethod, headers, rawQuery, body, isBase64Encoded } = event;
  const query = new URLSearchParams(rawQuery);
  const encoding = isBase64Encoded ? "base64" : headers["content-encoding"] || "utf-8";
  const rawBody = typeof body === "string" ? Buffer.from(body, encoding) : body;
  const rendered = await render({
    method: httpMethod,
    headers,
    path,
    query,
    rawBody
  });
  if (rendered) {
    return {
      isBase64Encoded: false,
      statusCode: rendered.status,
      ...splitHeaders(rendered.headers),
      body: rendered.body
    };
  }
  return {
    statusCode: 404,
    body: "Not found"
  };
}
function splitHeaders(headers) {
  const h = {};
  const m = {};
  for (const key in headers) {
    const value = headers[key];
    const target = Array.isArray(value) ? m : h;
    target[key] = value;
  }
  return {
    headers: h,
    multiValueHeaders: m
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
