import { expect, test } from 'vitest'
import { LocalizedModel } from '../src/index'

class AppObject extends LocalizedModel{
  constructor(){
    super();
    this.header = '';
    this.description = '';
    return this._localizedProxy;
  }
  fromJSON(obj){
    this.initLocalizedValue('header', obj.localizations);
    this.initLocalizedValue('description', obj.localizations);
    return this;
  }
  toJSON(){
    return {
      localizations: this.inflateLocales({
        header: 'header',
        description: 'description'
      })
    }
  }
}

test('Extended classes api', () => {
  let appObj = new AppObject();
  expect(appObj.localize).toBeTypeOf('function');
  expect(appObj._localeKey).toBe('en');
  expect(appObj._strMap).toBeTypeOf('object');
})



