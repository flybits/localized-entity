import { expect, test } from 'vitest'
import { LocalizedModel } from '../src/index'

class AppObject extends LocalizedModel{
  constructor(){
    super();
    this.secondLevelObj = this.localizeObj('secondLevelObj', {
      header: '',
      title: '',
      description: ''
    })

    return this._localizedProxy;
  }
  fromJSON(obj){
    this.initLocalizedValue('secondLevelObj.header', obj.secondLevel.localizations, 'header');
    this.initLocalizedValue('secondLevelObj.title', obj.secondLevel.localizations, 'subHeader');
    this.initLocalizedValue('secondLevelObj.description', obj.secondLevel.localizations, 'description');
    return this;
  }
  toJSON(){
    return {
      secondLevel: {
        localizations: this.inflateLocales({
          'secondLevelObj.header': 'header',
          'secondLevelObj.title': 'subHeader',
          'secondLevelObj.description': 'description'
        })
      }
    }
  }
}

const serverJSON = {
  "secondLevel": {
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
  }
};

test('Default english attributes are set', () => {
  let appObj = new AppObject().fromJSON(serverJSON);
  expect(appObj.secondLevelObj.header).toBe(serverJSON.secondLevel.localizations.en.header);
  expect(appObj.secondLevelObj.title).toBe(serverJSON.secondLevel.localizations.en.subHeader);
  expect(appObj.secondLevelObj.description).toBe(serverJSON.secondLevel.localizations.en.description);
})

test('Localize will swap values', () => {
  let appObj = new AppObject().fromJSON(serverJSON);
  expect(appObj.secondLevelObj.header).toBe(serverJSON.secondLevel.localizations.en.header);
  appObj.localize('fr');
  expect(appObj.secondLevelObj.header).toBe(serverJSON.secondLevel.localizations.fr.header);
})

test('Basic inflation', () => {
  let appObj = new AppObject().fromJSON(serverJSON);
  let serverPayload = appObj.toJSON();
  expect(serverPayload?.secondLevel?.localizations?.en?.header).toBe(serverJSON.secondLevel.localizations.en.header);
  expect(serverPayload?.secondLevel?.localizations?.en?.subHeader).toBe(serverJSON.secondLevel.localizations.en.subHeader);
  expect(serverPayload?.secondLevel?.localizations?.en?.description).toBe(serverJSON.secondLevel.localizations.en.description);
  expect(serverPayload?.secondLevel?.localizations?.fr?.header).toBe(serverJSON.secondLevel.localizations.fr.header);
  expect(serverPayload?.secondLevel?.localizations?.fr?.description).toBe(serverJSON.secondLevel.localizations.fr.description);
})

test('Update respective proxied locale values', () => {
  let appObj = new AppObject().fromJSON(serverJSON);
  appObj.secondLevelObj.header = 'englishtest';
  appObj.localize('fr');
  appObj.secondLevelObj.header = 'frenchtest';
  let serverPayload = appObj.toJSON();
  expect(serverPayload?.secondLevel?.localizations?.en?.header).toBe('englishtest');
  expect(serverPayload?.secondLevel?.localizations?.fr?.header).toBe('frenchtest');
})

test('New instance setting attribute will serialize', () => {
  let appObj = new AppObject();
  appObj.secondLevelObj.header = 'first value';
  appObj.localize('fr');
  appObj.secondLevelObj.header = 'french value';
  let serverPayload = appObj.toJSON();
  expect(serverPayload?.secondLevel).toBeInstanceOf(Object)
  expect(serverPayload?.secondLevel?.localizations?.en?.header).toBe('first value')
  expect(serverPayload?.secondLevel?.localizations?.fr?.header).toBe('french value')
})