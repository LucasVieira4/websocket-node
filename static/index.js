document.addEventListener('DOMContentLoaded', () => {

    let ws;
    // Get the necessary elements
    const messages = document.querySelector('#messages');
    const wsClose = document.querySelector('#ws-close');

    function showMessage(message) { // TODO: Fix
        if (!messages) {
            return;
        }
        const element = document.createElement('div');
        element.classList.add('row', 'py-3');
        element.innerHTML = `
        <div class="col align-self-center">
            <div class="card">
                <div class="card-body px-3 pt-3 pb-0">
                    <p class="fs-5">${message}</p>
                </div>
            </div>
        </div>
        `;
        document.querySelector(`#messages`).append(element);
    }

    function closeConnection() {
        if (!!ws) {
            ws.close();
        }
    }

    // fetch the posts
    fetchPosts('/posts');

    // Connect to websocket automatically when the page is loaded

    closeConnection();

    ws = new WebSocket('ws://localhost:3000');

    ws.addEventListener('error', () => {
        showMessage('Websocket error');
    });

    ws.addEventListener('open', () => {
        showMessage('Websocket Connection Established');
    });

    ws.addEventListener('close', () => {
        showMessage('Websocket Connection Closed');
    });

    ws.addEventListener('message', (msg) => {
        fetchPosts('/posts');
    });


    wsClose.addEventListener('click', () => closeConnection());


})


function fetchPosts(url) {
    fetch(url)
    .then(response => response.json())
    .then(postList => {
        // empty the post div
        document.querySelector('#posts_div').innerHTML = '';
        postList.forEach(post => {
            createPosts(post);
        });
    })
}

function createPosts(post) {
    // Create the div to append
    const element = document.createElement('div');

    // Add the classes for the row
    element.classList.add("row", 'py-3');

    // Insert all the needed information
    element.innerHTML = `
    <div class="col align-self-center">
        <div class="card">
            <div class="card-body px-3 pt-3 pb-0">
                <h4 class="fs-3">${post.username}</h4>
                <p class="fs-5">${post.content}</p>
            </div>
        </div>
    </div>
    `;

    // Append
    document.querySelector(`#posts_div`).append(element);
}



//ws.send(val);
//wsInput.value = '';
//showMessage(`Sent: "${val}"`);