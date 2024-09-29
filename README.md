# tunelink-backend
A node.js with express server
## Set up instructions

1. Clone this repository to your work directory
2. Navigate into `tunelink-backend` (this repo) directory
3. Run `npm i`, this will install all required packages for the backend

## Run the server

1. After you have set up, run `node server.js` to start the server
2. You can navigate to `localhost:3000/health` to check health status of the server

## Routes
- `/api-docs`
    - An interactive api documentation page that lists available routes
    - Useful for development

- `GET`:`/health`
    - Response:
        - 200: Server up and running
        - *: Server not running
- `POST`: `/api/get_feed`
    - Response:
        - 200: Returns a JSON object array, each object is an individual post on the homepage wall
        - 500: Internal server error

## Tests

- Run `npm test` to run tests defined in `/tests`
- You can also use Postman for api testing

## Updates
- Route documentation can be automated later on
- Test will be updated
- Data source will switch to a cloud source
