# kreepo
NodeJS implementation of Repository pattern

## Insallation

`npm install --save kreepo@latest`

## Usage

To use your first Repository just import module and call a factory method.

```javascript
const kreepo = require('kreepo');

// create new repository
const dummyRepository = kreepo.createRepository();
```

All methods are thenable (return Promises), while construction process is synchronious.

```javascript
const dummyRepository = kreepo.createRepository();

dummyRepository.set('key', 'value')
  .then(() => dummyRepository.get('key'))
  .then((result) => console.log(result));
```

## Datasources

Repository pattern requires some kind of adapters for each data-layer platform to allow unified interface. **Datasource** classes implement those adapters.

Datasources are classes that incapsulate logic of direct data-layer communiation.

Many of general purpose datasources are provided with **kreepo** package.

```javascript
// access datasource classes within a kreepo facade
const { InMemoryDatasource, JsonDatasource } = kreepo.datasource;

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

#### get(id)

Get an entity from a Repository.

> @param  {any} id   -- identifier of entity to get
>
> @return {Promise}  -- resolves with a requested entity or null

Performs lookup over registered Datasources with respect ro readPriority of those.

Attempts to read data from a Datasource with a maximum readPriority.

Value is mapped with emtityFactory if the one is specified in constructor.

#### set(id, value)

Save entity within a Repository.

> @param {any} id    -- identifier of entity to save <br>
> @param {any} value -- value to be saved
> 
> @return {Promise}  -- resolves with an identifier of saved entity or null if entity wasn't saved

Saves data to every WRITE_ALWAYS Datasource

Saves data to a single WRITE_FIRST Datasource with a maximum 
writePriority property

Skips NO_WRITE datasource

Saves data to cache instead of triggering Datasource directly when SYNC_ON_REQUEST or SYNC_ON_TIMEOUT sync strategy chosen.

#### delete(id)

Delete entity from a Repository.

> @param  {any} id     -- identifier of entity to remove
>
> @return {Promise}    -- resolves with true if removal operation was performed and false if it wasn't

Removes data from each datasource except those that marked as NO_WRITE.

Saves data to cache instead of triggering Datasource directly when SYNC_ON_REQUEST or SYNC_ON_TIMEOUT sync strategy chosen.

#### getall()

List all keys that available all over the Datasources

> @return {Promise}    -- resolves with list of available keys

#### find(selector)

Search througth available keys using regular expression

> @param  {RegExp}   selector  -- regular xepression to test keys
>
> @return {Promise}            -- resolves with list of matching keys

#### mget(ids)

Get multiple entities from a Repository.

> @param  {Array<any>} ids   -- list of entity identifiers
>
> @return {Promise}          -- resolves with key-value mapping of ids to entities

Performs lookup over registered Datasources with respect ro readPriority of those.

Attempts to read data from a Datasource with a maximum readPriority.

Value is mapped with emtityFactory if the one is specified in constructor.

#### mset(payload)

Save multiple entities within a Repository.

> @param  {Object<id => value>} payload  -- represents values that should be saved under id
>
> @return {Promise}                      -- resolves with list of seted ids

Mitigates #set logic fluently

Use #set method directly if datasource have no #mset implemented

#### mdelete(ids)

Delete multiple entities from a Repository.

> @param  {Array<any>} ids   -- list of entity identifiers
>
> @return {Promise}          -- resolves with key-value mapping with id's and true, if value was removed

Removes data from each datasource except those that marked as NO_WRITE.

Saves data to cache instead of triggering Datasource directly when SYNC_ON_REQUEST or SYNC_ON_TIMEOUT sync strategy chosen.

#### sync()

TBD
