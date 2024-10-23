# tunelink-backend
A node.js with express server
## Set up instructions

1. Clone this repository to your work directory
2. Navigate into `tunelink-backend` (this repo) directory
3. Run `npm i`, this will install all required packages for the backend
4. Create a `.env` at root and copy contents of `.env.copy` into there, message on groupchat to get secrets

You are ready to run the backend

## Run the server

1. After you have set up, run `node server.js` to start the server
2. You can navigate to `localhost:3000/health` to check health status of the server

## Routes
- `/api-docs`
    - An interactive api documentation page that lists available routes
    - Useful for development

## Tests

- Run `npm test` to run tests defined in `/tests`
- You can also use Postman for api testing
- You will need testing_data to run all tests, email Ozel for the ZIP
- Run `npm test -- tests/uploadRoutes.test.js` to run individual test suites
- I suggest running test individually, mongo has to drop the database between each run, when they all run together it fails some tests because of not waiting for drop, in individual runs there are no errors.

## Updates
- Route documentation can be automated later on
- Test will be updated
- Data source will switch to a cloud source
