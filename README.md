# tunelink-backend
A node.js with express server
## Set up instructions

1. Clone this repository to your work directory
2. Navigate into `tunelink-backend` (this repo) directory
3. Run `npm i`, this will install all required packages for the backend
4. Create a `.env` at root and copy contents of `.env.copy` into there, message on groupchat to get secrets, or remind ozel to email you.
5. Remind Ozel to give you access to mongodb, not required but it is helpful
6. Navigate to `data/`, there should be a test_data.zip, unzip it, now the path should be `data/test_data`, inside of it there are three directories and to json files.

You are ready to run the backend

## Run the server

1. After you have set up, run `node server.js` to start the server
2. You can navigate to `localhost:3000/health` to check health status of the server

## Routes
- `/api-docs`
    - An interactive api documentation page that lists available routes
    - Useful for development
    - The routes to update (PUT) a user does not work on swagger
    - Routes to upload User through swagger does not work
    - Route to upload a post through swagger does not work
    - This is because I need to put more detailed API information to swagger, it is just difficult to do
    - In the meantime I suggest reading tests, to understand what the api expects.

    In short:
    uploadPost expects:
    ```js
    const formData = new FormData();
    formData.append("ownerUser", "83610374183ffc"); // A mongo object if
    formData.append("likesCount", 0);
    formData.append("caption", "Lorem ipsum");
    formData.append("outLinks", JSON.stringify({"youtube": "url", "drive": "url"})); // etc
    formData.append("audio", audioFile); // File is handled by the IO, but basically it must be read to buffer, than you pass in the buffer
    formData.append("albumCover", albumCoverFile); // Same goes

    // and you make the fetch like this
    fetch("/api/upload/uploadPost", {
        method: "POST",
        body: formData
    });
    ```

    uploadUser expects:
    ```js
    const formData = new FormData();
    formData.append("user", JSON.stringify(user)); // the user object should have the required fields, you can see a template of it in the json test data
    formData.append("userAvatar", avatarFile); // Again buffer
    fetch("/api/upload/uploadUser", {
        method: "POST",
        body: formData
    });
    ```

    You can make example requests like these for now

## Populating database
- Make sure you have the test_data, inside data directory
- Run `npm test -- tests/uploadRoutes.test.js` to run tests that will populate the database

## Tests
- Run `npm test` to run tests defined in `/tests`
- You can also use Postman for api testing
- You will need testing_data to run all tests, email Ozel for the ZIP
- Run `npm test -- tests/uploadRoutes.test.js` to run individual test suites
- I suggest running test individually, mongo has to drop the database between each run, when they all run together it fails some tests because of not waiting for drop, in individual runs there are no errors.
