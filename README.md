# NODE TEMPLATE (Javascript)

This is a flexible, and generic Node.js and Express template which covers most basic to advance needs of modern REST API's. This conveniently implements MongoDB as the database of choice using Mongoose ORM; efficiently reducing the learning curve for using the template.

## DEPENDENCIES

The template comes with the following dependencies defined:

### APPLICATION DEPENDENCIES

* `compression` - `https://github.com/expressjs/compression#readme`
* `cors` - `https://github.com/expressjs/cors#readme`
* `dotenv` - `https://github.com/motdotla/dotenv#readme`
* `helmet` - `https://helmetjs.github.io/`
* `mongoDB` - `https://www.mongodb.com/`
* `mongoose` - `https://mongoosejs.com/`
* `morgan` - `https://github.com/expressjs/morgan#readme`
* `winston` - `https://github.com/winstonjs/winston#readme`

### DEV DEPENDENCIES

* [ESLint](https://eslint.org/)
* [Prettier](https://www.npmjs.com/package/prettier)
* [nodemon](https://www.npmjs.com/package/nodemon)
* [eslint](https://www.npmjs.com/package/eslint)
* [eslint-config-airbnb](https://www.npmjs.com/package/eslint-config-airbnb)
* [eslint-config-prettier](https://www.npmjs.com/package/eslint-config-prettier)
* [eslint-plugin-prettier](https://www.npmjs.com/package/eslint-plugin-prettier)
* [eslint-plugin-security](https://www.npmjs.com/package/eslint-plugin-security)
* [jsdoc](https://www.npmjs.com/package/jsdoc)
* [@types/bcrypt](https://www.npmjs.com/package/@types/bcrypt)
* [@types/compression](https://www.npmjs.com/package/@types/compression)
* [@types/cors](https://www.npmjs.com/package/@types/cors)
* [@types/glob](https://www.npmjs.com/package/@types/glob)
* [@types/hpp](https://www.npmjs.com/package/@types/hpp)
* [@types/jsonwebtoken](https://www.npmjs.com/package/@types/jsonwebtoken)
* [@types/morgan](https://www.npmjs.com/package/@types/morgan)
* [@types/node-cron](https://www.npmjs.com/package/@types/node-cron)
* [@types/nodemailer](https://www.npmjs.com/package/@types/nodemailer)


### TESTING DEPENDENCIES

* [chai](https://www.npmjs.com/package/chai)
* [mocha](https://mochajs.org/)
* [nyc](https://istanbul.js.org/)
* [proxyquire](https://github.com/thlorenz/proxyquire#readme)
* [sinon](https://sinonjs.org/)

## CONFIGURATION

1. Install dependencies.
    * `npm i` or `yarn install`
2. Create the following environment variables manually or by copying the `.env.example` file to a `.env` file:
    * To auto generate a .env use: `npm run generate-env` or `yarn generate-env`
    * `NODE_ENV`: specifies the working environment
    * `APP_PORT`: Sets  a default app port.
    * `APP_DB_URI`: Sets  a default Mongo DB connection URI.
    * `APP_NAME`: Sets the application name.
3. Run the Node.js server locally.
    * `npm run dev` or `yarn dev`
4. Test application locally and ensure all tests pass with 100% coverage.
    * `npm run test` or `yarn test`
    * To generate a web based view of the coverage use: `npm run test-publish` or `yarn test-publish`
5. To generate an updated .env.example.
    * `npm run update-example-env` or `yarn update-example-env`
6. To generate documentation using JSDocs.
    * `npm run update-documentation` or `yarn update-documentation`
7. Run in a production environment
    * `npm run start` or `yarn start`
8. Happy hacking and remain awesome 🤓.

## LICENSE

* [ISC](https://www.isc.org/licenses/) - `We use the ISC License with ❤️.`
