# tunelink-backend
A node.js with express server
## Set up instructions

1. Clone this repository to your work directory
2. Navigate into `tunelink-backend` (this repo) directory
3. Run `npm i`, this will install all required packages for the backend

## Run the server

1. After you have set up, run `node app.js` to start the server
2. You can navigate to `localhost:3000/health` to check health status of the server

## Routes
- `GET`:`/health`
    - Response:
        - 200: Server up and running
        - *: Server not running
- `POST`: `/get_feed`
    - Response:
        - 200: Returns a JSON object array, each object is an individual post on the homepage wall
        - 500: Internal server error

## Notes
- Currently feed data is hard-coded in `/data`, this should change after we integrate mongo etc

- Currently jest testing does not work because the project is configured with `type:module`, it might be changed later

- You can use Postman for api testing

## Updates
- Route documentation can be automated later on
- Test will be updated
- Data source will switch to a cloud source
