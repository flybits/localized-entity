import { expect, test } from 'vitest'
import { LocalizedModel } from '../src/index'

class AppObject extends LocalizedModel{
  constructor(){
    super();
    this.items = this.localizeArray('items', ['header','title','description'])

    return this._localizedProxy;
  }
  fromJSON(obj){
    obj.objArray.forEach((arrObj, index) => {
      this.items.push({
        header: this.initLocalizedArrValue('items', index, 'header', arrObj.localizations),
        title: this.initLocalizedArrValue('items', index, 'title', arrObj.localizations, 'subHeader'),
        description: this.initLocalizedArrValue('items', index, 'description', arrObj.localizations)
      })
    });

    return this;
  }
  toJSON(){
    return {
      objArray: this.items.map((obj, index) => {
        return {
          localizations: this.inflateLocales({
            'items.{index}.header': 'header',
            'items.{index}.title': 'subHeader',
            'items.{index}.description': 'description',
          }, index)
        }
      })
    }
  }
}

const serverJSON = {
  "objArray": [{
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
  }]
};

test('Default english attributes are set', () => {
  let appObj = new AppObject().fromJSON(serverJSON);
  expect(appObj.items[0].header).toBe(serverJSON.objArray[0].localizations.en.header);
  expect(appObj.items[0].title).toBe(serverJSON.objArray[0].localizations.en.subHeader);
  expect(appObj.items[0].description).toBe(serverJSON.objArray[0].localizations.en.description);
})

test('Localize will swap values', () => {
  let appObj = new AppObject().fromJSON(serverJSON);
  expect(appObj.items[0].header).toBe(serverJSON.objArray[0].localizations.en.header);
  appObj.localize('fr');
  expect(appObj.items[0].header).toBe(serverJSON.objArray[0].localizations.fr.header);
})

test('Basic inflation', () => {
  let appObj = new AppObject().fromJSON(serverJSON);
  let serverPayload = appObj.toJSON();
  expect(serverPayload?.objArray?.[0]?.localizations?.en?.header).toBe(serverJSON.objArray[0].localizations.en.header);
  expect(serverPayload?.objArray?.[0]?.localizations?.en?.subHeader).toBe(serverJSON.objArray[0].localizations.en.subHeader);
  expect(serverPayload?.objArray?.[0]?.localizations?.en?.description).toBe(serverJSON.objArray[0].localizations.en.description);
  expect(serverPayload?.objArray?.[0]?.localizations?.fr?.header).toBe(serverJSON.objArray[0].localizations.fr.header);
  expect(serverPayload?.objArray?.[0]?.localizations?.fr?.description).toBe(serverJSON.objArray[0].localizations.fr.description);
})

test('Update respective proxied locale values', () => {
  let appObj = new AppObject().fromJSON(serverJSON);
  appObj.items[0].header = 'englishtest';
  appObj.localize('fr');
  appObj.items[0].header = 'frenchtest';
  let serverPayload = appObj.toJSON();
  expect(serverPayload?.objArray?.[0]?.localizations?.en?.header).toBe('englishtest');
  expect(serverPayload?.objArray?.[0]?.localizations?.fr?.header).toBe('frenchtest');
})

test('Adding array object then editing attributes', () => {
  let appObj = new AppObject().fromJSON(serverJSON);
  appObj.items.push({});
  appObj.items[1].header = 'new english header';
  appObj.items[1].description = 'new english description';
  appObj.items[1].title = 'new english title';
  
  let serverPayload = appObj.toJSON();
  expect(serverPayload?.objArray?.[1]).toBeTruthy();
  expect(serverPayload?.objArray?.[1]?.localizations?.en?.header).toBe('new english header');
  expect(serverPayload?.objArray?.[1]?.localizations?.en?.description).toBe('new english description');
  expect(serverPayload?.objArray?.[1]?.localizations?.en?.subHeader).toBe('new english title');
})

test('Removing object', () => {
  let appObj = new AppObject().fromJSON(serverJSON);
  appObj.items.pop();
  
  let serverPayload = appObj.toJSON();
  expect(serverPayload?.objArray?.length).toBe(0);
});

/*
test('Adding array object with new attributes', () => {
  let appObj = new AppObject().fromJSON(serverJSON);
  appObj.items.push({
    header: 'new english header',
    description: 'new english description',
    title: 'new english title'
  });
  
  let serverPayload = appObj.toJSON();
  console.log('wtf', JSON.stringify(serverPayload, null, 2));
  expect(serverPayload?.objArray?.[1]).toBeTruthy();
  expect(serverPayload?.objArray?.[1]?.localizations?.en?.header).toBe('new english header');
  expect(serverPayload?.objArray?.[1]?.localizations?.en?.description).toBe('new english description');
  expect(serverPayload?.objArray?.[1]?.localizations?.en?.subHeader).toBe('new english title');
})
*/