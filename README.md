# bytebroker
NodeJS implementation of Repository pattern

## Insallation

`npm install --save bytebroker@latest`

## Usage

To use your first Repository just import module and call a factory method.

```javascript
const bytebroker = require('bytebroker');

// create new repository
const dummyRepository = bytebroker.createRepository();
```

All methods are thenable (return Promises), while construction process is synchronious.

```javascript
const dummyRepository = bytebroker.createRepository();

dummyRepository.set('key', 'value')
  .then(() => dummyRepository.get('key'))
  .then((result) => console.log(result));
```

## Datasources

Repository pattern requires some kind of adapters for each data-layer platform to allow unified interface. **Datasource** classes implement those adapters.

Datasources are classes that incapsulate logic of direct data-layer communiation.

Many of general purpose datasources are provided with **bytebroker** package.

```javascript
// access datasource classes within a bytebroker facade
const { InMemoryDatasource, JsonDatasource } = bytebroker.datasource;

// create a Datasource that stores data in RAM
const ramDatasource = new InMemoryDatasource();

// create a Datasource that stores data in a JSON file
const jsonDatasource = new JsonDatasource('/tmp/test.json');

// create a Repository that access both Datasorses
const repository = bytebroket.createRepository({
  datasource: [ramDatasource, jsonDatasource],
});
```

## API Reference

### Repository

#### get()

Get an entity from a Repository.

> @param  {any} id   -- identifier of entity to get
> @return {Promise}  -- resolves with a requested entity or null

Performs lookup over registered Datasources with respect ro readPriority of those.
Attempts to read data from a Datasource with a maximum readPriority.
Value is mapped with emtityFactory if the one is specified in constructor.

#### set()

#### delete()

#### getall()

#### find()

#### mget()

#### mset()

#### mdelete()

#### sync()
