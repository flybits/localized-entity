import NumUtil from "./num";

var ObjUtil = {
  isObject: function(obj){
    return typeof obj === 'object' && obj !== null;
  },
  getByStr: function (obj, keyStr) {
    // convert indexes to properties
    keyStr = keyStr.replace(/\[(\w+)\]/g, '.$1');
    // strip a leading dot
    keyStr = keyStr.replace(/^\./, '');
    var aKeys = keyStr.split('.');
    for (var i = 0, n = aKeys.length; i < n; ++i) {
      var key = aKeys[i];
      if (ObjUtil.isObject(obj) && key in obj) {
        obj = obj[key];
      } else {
        return;
      }
    }
    return obj;
  },
  setByStr: function (obj, keyStr, val) {
    // convert indexes to properties
    keyStr = keyStr.replace(/\[(\w+)\]/g, '.$1');
    // strip a leading dot
    keyStr = keyStr.replace(/^\./, '');
    var aKeys = keyStr.split('.');
    for (var i = 0, n = aKeys.length; i < n; i++) {
      var key = aKeys[i];
      if (key in obj && i + 1 < n) {
        obj = obj[key];
      } else if (!(key in obj) && i + 1 < n) {
        obj[key] = NumUtil.isStrNumber(aKeys[i+1]) ? [] : {};
        obj = obj[key];
      } else {
        obj[key] = val;
        return val;
      }
    }
  },
};

export default ObjUtil;