var regexes = {
  ipv4: /^(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/,
  ipv6: /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i,
};

function not(func: any) {
  return function () {
    return !func.apply(null, Array.prototype.slice.call(arguments));
  };
}

function existy(value: any) {
  return value != null;
}

function ip(value: any) {
  return (
    (existy(value) && regexes.ipv4.test(value)) || regexes.ipv6.test(value)
  );
}

function object(value: any) {
  return Object(value) === value;
}

function string(value: any) {
  return Object.prototype.toString.call(value) === "[object String]";
}

var is = {
  existy: existy,
  ip: ip,
  object: object,
  string: string,
  not: {
    existy: not(existy),
    ip: not(ip),
    object: not(object),
    string: not(string),
  },
};
export default is;
