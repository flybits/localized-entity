import ObjUtil from '../utils/obj.js';

class LocalizedModel{
  constructor(){
    this._strMap = {}; // attrKey => locale:value
    this._localeKey = 'en';
    const model = this;
    this._localizedProxy = new Proxy(this, {
      set(target, prop, newVal){
        var attrMap = model._strMap[prop];
        if(!attrMap && prop !== '_strMap' && prop !== '_localeKey' && prop !== '_localizedProxy'){
          attrMap = model._strMap[prop] = {};
        }
        if(attrMap){
          model._setLocalizedValue(prop, newVal);
        }
        return Reflect.set(...arguments);
      }
    });
  }
  _setLocalizedValue(attrKey, newVal){
    if(this._strMap[attrKey]){
      this._strMap[attrKey][this._localeKey] = newVal;
    }
  }
  _applyLocalizedValue(attrKey){
    if(this._strMap[attrKey] && !Object.prototype.hasOwnProperty.call(this._strMap[attrKey], this._localeKey)){
      this._strMap[attrKey][this._localeKey] = '';
    }
    ObjUtil.setByStr(this, attrKey, this._strMap[attrKey][this._localeKey]);
  }
  /**
   * Applies localized strings onto model attributes
   * @param {string} localeKey Locale to replace attribute strings with (eg. en, fr, ar)
   */
  localize(localeKey){
    const model = this;
    this._localeKey = localeKey;
    Object.keys(this._strMap).forEach(function(attrKey){
      model._applyLocalizedValue(attrKey);
    })

    const recursiveLocalize = function(obj){
      if(obj === null || obj === undefined){
        return;
      }
      Object.keys(obj).forEach(function(key){
        const val = obj[key];
        if(key === '_strMap' || 
           key === '_localeKey' ||
           key === '_localizedProxy' || 
           val === model){
          return;
        }

        if(val instanceof LocalizedModel){
          val.localize(localeKey);
        } else if(Array.isArray(val) && typeof val[0] === 'object'){
          val.forEach(function(arrObj){
            if(arrObj instanceof LocalizedModel){
              arrObj.localize(localeKey);
            } else if(arrObj !== model){
              recursiveLocalize(arrObj);
            }
          })
        } else if(!Array.isArray(val) && typeof val === 'object'){
          recursiveLocalize(val);
        }
      })
    }
    recursiveLocalize(this);
  }
  initLocalizedValue(attrKey, ogLocaleObj, ogAttrKey){
    const attrMap = this._strMap[attrKey] = {};
    if(!ogLocaleObj){
      return '';
    }

    const existingLocaleKeys = Object.keys(ogLocaleObj);
    existingLocaleKeys.forEach(function(langKey){
      attrMap[langKey] = ogLocaleObj[langKey][ogAttrKey || attrKey];
    });
    this._applyLocalizedValue(attrKey);
  }
  initLocalizedArrValue(arrKey, index, attrKey, ogLocaleObj, ogAttrKey){
    const resolvedAttrKey = `${arrKey}.${index}.${attrKey}`;
    const attrMap = this._strMap[resolvedAttrKey] = {};
    if(!ogLocaleObj){
      return '';
    }
    
    const existingLocaleKeys = Object.keys(ogLocaleObj);
    existingLocaleKeys.forEach(function(langKey){
      attrMap[langKey] = ogLocaleObj[langKey][ogAttrKey || attrKey];
    });
    return attrMap[this._localeKey];
  }
  localizeObj(attrKey, object){
    const model = this;
    return new Proxy(object, {
      set(target, prop, newVal){
        const resolvedAttrKey = `${attrKey}.${prop}`;
        var attrMap = model._strMap[resolvedAttrKey];
        if(!attrMap && prop !== '_strMap' && prop !== '_localeKey' && prop !== '_localizedProxy'){
          attrMap = model._strMap[resolvedAttrKey] = {};
        }
        if(attrMap){
          model._setLocalizedValue(resolvedAttrKey, newVal);
        }
        return Reflect.set(...arguments);
      }
    });
  }
  localizeArray(arrKey, attrKeys){
    const model = this;
    return new Proxy([], {
      set(target, prop, newVal){
        const resolvedArrKey = `${arrKey}.${prop}`;
        if(Number.isInteger(+prop)){
          target[prop] = model.localizeObj(resolvedArrKey, newVal);
          attrKeys.forEach(function(attrKey){
            if(!model._strMap[`${resolvedArrKey}.${attrKey}`]){
              model._strMap[`${resolvedArrKey}.${attrKey}`] = {};
            }
            if(newVal[attrKey]){
              model._setLocalizedValue(`${resolvedArrKey}.${attrKey}`, newVal[attrKey]);
            }
          });
          return true;
        }
        return Reflect.set(...arguments);
      },
      deleteProperty(target, prop) {
        const resolvedArrObjKey = `${arrKey}.${prop}.`;
        Object.keys(model._strMap).forEach(function(key){
          if(key.indexOf(resolvedArrObjKey) > -1){
            delete model._strMap[key];
          }
        })

        return Reflect.deleteProperty(...arguments);
      },
    })
  }
  /**
   * 
   * @param {Object} attrKeyMap Map of stored cache key to output key
   * @param {int} [arrIndex] Index of object in array; will replace {index} with the provided number.  
   * @returns Localization object
   * @example
   * {
   *   "en": {
   *     "title": "hello"
   *   },{
   *   "fr": {
   *     "title": "bonjour" 
   *   }
   * }
   */
  inflateLocales(attrKeyMap, arrIndex){
    var localeObj = {};
    var localeKeysMap = {};

    Object.keys(attrKeyMap).forEach((cacheKey) => {
      var resolvedCacheKey = cacheKey;
      if(arrIndex > -1){
        resolvedCacheKey = cacheKey.replace('{index}', arrIndex);
      }
      let attrMap = this._strMap[resolvedCacheKey];
      if(attrMap){
        Object.keys(attrMap).forEach(function(localeKey){
          localeKeysMap[localeKey] = true;
          const outputKey = attrKeyMap[cacheKey];
          if(!Object.prototype.hasOwnProperty.call(localeObj, localeKey)){
            localeObj[localeKey] = {};
          }
          localeObj[localeKey][outputKey] = attrMap[localeKey] || '';
        })
      }
    })

    Object.keys(localeKeysMap).forEach(function(localeKey){
      let localeMap = localeObj[localeKey]
      
      Object.keys(attrKeyMap).forEach((cacheKey) => {
        const outputKey = attrKeyMap[cacheKey];
        if(!Object.prototype.hasOwnProperty.call(localeMap, outputKey)){
          localeMap[outputKey] = '';
        }
      })
    })

    return localeObj;
  }
}


export default LocalizedModel;