import { expect, test } from 'vitest'
import { LocalizedModel } from '../src/index'

class AppObject extends LocalizedModel{
  constructor(){
    super();
    this.header = '';
    this.description = '';
    this.title = '';
    return this._localizedProxy;
  }
  fromJSON(obj){
    this.initLocalizedValue('header', obj.localizations);
    this.initLocalizedValue('description', obj.localizations);
    this.initLocalizedValue('title', obj.localizations, 'subHeader');
    return this;
  }
  toJSON(){
    return {
      localizations: this.inflateLocales({
        header: 'header',
        description: 'description',
        title: 'subHeader'
      })
    }
  }
}

const serverJSON = {
  "localizations": {
    "en": {
      "header": "this is a header",
      "subHeader": "this is a subheader",
      "description": "this is a description"
    },
    "fr": {
      "header": "il s’agit d’un en-tête",
      "subHeader": "ceci est un sous-titre",
      "description": "il s’agit d’une description"
    }
  }
};

test('Default english attributes are set', () => {
  let appObj = new AppObject().fromJSON(serverJSON);
  expect(appObj.header).toBe(serverJSON.localizations.en.header);
  expect(appObj.description).toBe(serverJSON.localizations.en.description);
})

test('Custom attribute key translation', () => {
  let appObj = new AppObject().fromJSON(serverJSON);
  let serverPayload = appObj.toJSON();
  expect(appObj.title).toBe(serverJSON.localizations.en.subHeader);
  expect(serverPayload?.localizations?.en?.subHeader).toBe(serverJSON.localizations.en.subHeader);
})

test('Localize will swap values', () => {
  let appObj = new AppObject().fromJSON(serverJSON);
  expect(appObj.header).toBe(serverJSON.localizations.en.header);
  appObj.localize('fr');
  expect(appObj.header).toBe(serverJSON.localizations.fr.header);
})

test('Basic inflation', () => {
  let appObj = new AppObject().fromJSON(serverJSON);
  let serverPayload = appObj.toJSON();
  expect(serverPayload?.localizations?.en?.header).toBe(serverJSON.localizations.en.header);
  expect(serverPayload?.localizations?.en?.description).toBe(serverJSON.localizations.en.description);
  expect(serverPayload?.localizations?.fr?.header).toBe(serverJSON.localizations.fr.header);
  expect(serverPayload?.localizations?.fr?.description).toBe(serverJSON.localizations.fr.description);
})

test('Update respective proxied locale values', () => {
  let appObj = new AppObject().fromJSON(serverJSON);
  appObj.header = 'englishtest';
  appObj.localize('fr');
  appObj.header = 'frenchtest';
  let serverPayload = appObj.toJSON();
  expect(serverPayload?.localizations?.en?.header).toBe('englishtest');
  expect(serverPayload?.localizations?.fr?.header).toBe('frenchtest');
})

test('New instance setting attribute will serialize', () => {
  let appObj = new AppObject();
  appObj.header = 'first value';
  appObj.localize('fr');
  appObj.header = 'french value';
  let serverPayload = appObj.toJSON();
  expect(serverPayload?.localizations?.en?.header).toBe('first value')
  expect(serverPayload?.localizations?.fr?.header).toBe('french value')
})

test('Serialization is symmetrical across locales even for empty values', () => {
  let appObj = new AppObject();
  appObj.header = 'first value';
  appObj.localize('fr');
  appObj.header = 'french value';
  let serverPayload = appObj.toJSON();
  expect(serverPayload?.localizations?.en?.header).toBe('first value');
  expect(serverPayload?.localizations?.en?.subHeader).toBe('');
  expect(serverPayload?.localizations?.en?.description).toBe('');
  expect(serverPayload?.localizations?.fr?.header).toBe('french value');
  expect(serverPayload?.localizations?.fr?.subHeader).toBe('');
  expect(serverPayload?.localizations?.fr?.description).toBe('');
})