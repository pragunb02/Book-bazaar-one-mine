const socket = io();
const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// // Retrieve the book ID from the URL query parameters
const urlParams = new URLSearchParams(window.location.search);
const bookId = urlParams.get("bookId");

let fromUser = "John";
let toUser = "Maria";

// function storeDetails() {
//   // fromUser = document.getElementById("from").value;
//   // console.log(data.user.name);
//   fetch("/get-user") // Assuming you have a route to fetch user details
//     //  console.log(data.user.name);
//     .then((response) => response.json())
//     .then((data) => {
//       const fromUser = data.user.name; // Assuming your response contains the details of the currently logged-in user
//       console.log(fromUser);
//       // const toUser = { name: toUserInput }; // Assuming 'toUserInput' is the recipient's name

//       // Emit details of established chat
//       // socket.emit("userDetails", { fromUser, toUser, bookId });
//     })
//     .catch((error) => {
//       console.error("Error fetching user details:", error);
//     });

//   // toUser = document.getElementById("to").value;
//   // Extract bookId from the URL
//   const queryParams = new URLSearchParams(window.location.search);
//   const bookId = queryParams.get("bookId");

//   // Fetch the owner's name based on the bookId
//   fetch(`/books/owner/${bookId}`) // Assuming you have a route to fetch the owner's details
//     .then((response) => response.json())
//     .then((data) => {
//       const toUser = data.owner.name; // Assuming your response contains the owner's name

//       // Set the owner's name to the 'to' field
//       // document.getElementById("to").value = ownerName;
//     })
//     .catch((error) => {
//       console.error("Error fetching owner details:", error);
//     });

//   element = document.querySelectorAll(".chat-messages");
//   socket.emit("userDetails", { fromUser, toUser, bookId }); //emits details of established chat
// }
function storeDetails() {
  // Fetch the currently logged-in user (fromUser)
  fetch("/get-user")
    .then((response) => response.json())
    .then((data) => {
      // console.log(data);
      fromUser = data.user.name; // Assuming your response contains the details of the currently logged-in user

      // Extract bookId from the URL
      const queryParams = new URLSearchParams(window.location.search);
      const bookId = queryParams.get("bookId");
      // toUser = bookId;
      // Fetch the owner's name based on the bookId
      fetch(`/books/owner/${bookId}`) // Assuming you have a route to fetch the owner's details
        .then((response) => response.json())
        .then((data) => {
          toUser = data.owner.name; // Assuming your response contains the owner's name

          // Emit details of established chat
          element = document.querySelectorAll(".chat-messages");
          if (toUser == fromUser) {
            alert("NOOO");
            return;
          }
          socket.emit("userDetails", { fromUser, toUser, bookId });
        })
        .catch((error) => {
          console.error("Error fetching owner details:", error);
        });
      // element = document.querySelectorAll(".chat-messages");
      // socket.emit("userDetails", { fromUser, toUser });
    })
    .catch((error) => {
      console.error("Error fetching user details:", error);
    });
}

function storeTo() {
  console.log(toUser);
}

//Submit message
chatForm.addEventListener("submit", (e) => {
  e.preventDefault(); //Prevents default logging to a file
  const msg = e.target.elements.msg.value;
  final = {
    fromUser: fromUser,
    toUser: toUser,
    msg: msg,
    bookId,
  };
  socket.emit("chatMessage", final); //emits chat message along with sender and reciever to server
  document.getElementById("msg").value = " ";
});

socket.on("output", (data) => {
  console.log(data);
});

socket.on("output", (data) => {
  //recieves the entire chat history upon logging in between two users and displays them
  for (var i = 0; i < data.length; i++) {
    outputMessage(data[i]);
  }
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on("message", (data) => {
  //recieves a message and displays it
  outputMessage(data);
  console.log(data);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.from}<span> ${message.time}, ${message.date}</span></p>
    <p class ="text">
        ${message.message}
    </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}
