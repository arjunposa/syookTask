// client.js

// Function to update the HTML with received data
function updateDataList(data) {
    const dataList = document.getElementById('data-list');
  
    // Clear previous data
    dataList.innerHTML = '';
  
    // Append each item to the list
    data.forEach((item) => {
      const listItem = document.createElement('li');
      listItem.textContent = JSON.stringify(item);
      dataList.appendChild(listItem);
    });
  }
  
  // Function to fetch data from the server
  function fetchDataFromServer() {
    fetch('/data') // Assuming the data endpoint is at '/data'
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Received data from the server:', data);
  
        // Update the HTML with the received data
        updateDataList(data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
  
  // Connect to the server
  const socket = io.connect('http://127.0.0.1:2001');
  
  // Handle events
  socket.on('connect', function () {
    console.log('Client has connected to the server!');
  
    // Fetch data when the client connects (you can call this function when needed)
    fetchDataFromServer();
  });
  
  socket.on('data', function (data) {
    console.log('Received data from the server:', data);
  
    // Update the HTML with the received data
    updateDataList(data);
  });
  
  socket.on('disconnect', function () {
    console.log('The client has disconnected!');
  });
  
  // You can send data to the server using socket.emit() as needed
  