// Defining some global constants
const animateClass = "glyphicon-refresh-animate";
const loadingHtml =
  '<span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> Loading';
const appTitle = "Users United";
let refreshTimeout;

function signedOutFlow() {
  $("#near-login-button").show();
  $("#near-login-button").click(() => {
    walletAccount.requestSignIn(
      // The contract name that would be authorized to be called by the user's account.
      window.nearConfig.contractName,
      appTitle
      // We can also provide URLs to redirect on success and failure.
      // The current URL is used by default.
    );
  });
}
// Renders given array of messages
function renderMessages(messages) {
  console.log(messages);
  let objs = [];
  for (let i = 0; i < messages.length; ++i) {
    objs.push(
      $("<div/>")
        .addClass("row")
        .append([
          $("<div/>")
            .addClass("col-sm-3")
            .append(
              $("<div/>").text(
                `User #${String(messages[i].index)}: ${messages[i].name}`
              )
            ),
          $("<div/>")
            .addClass("col-sm-3")
            .append($("<strong/>").text(" is boycotting face because")),
          $("<div/>")
            .addClass("col-sm-6")
            .addClass("message-text")
            .text(messages[i].text)
        ])
    );
  }
  // objs.reverse();
  $("#messages")
    // .empty()
    .append(objs);
  $("#refresh-span").removeClass(animateClass);
  if (messages.length) {
    lastIndex = Number(messages[messages.length - 1].index) + 1;
  }
}

// Calls view function on the contract and sets up timeout to be called again in 5 seconds
// It only calls the contract if the this page/tab is active.
lastIndex = 0;
function refreshMessages() {
  // If we already have a timeout scheduled, cancel it
  if (!!refreshTimeout) {
    clearTimeout(refreshTimeout);
    refreshTimeout = null;
  }
  // Schedules a new timeout
  refreshTimeout = setTimeout(refreshMessages, 60000);
  // Checking if the page is not active and exits without requesting messages from the chain
  // to avoid unnecessary queries to the devnet.
  if (document.hidden) {
    return;
  }
  // Adding animation UI
  $("#refresh-span").addClass(animateClass);
  // Calling the contract to read messages which makes a call to devnet.
  // The read call works even if the Account ID is not provided.
  contract
    .getRangeMessages({ start: lastIndex })
    .then(renderMessages)
    .catch(console.log);
}

// Submits a new message to the devnet
function submitMessage() {
  let text = $("#text-message").val();
  $("#text-message").val("");
  // Calls the addMessage on the contract with arguments {text=text}.
  const { id, name } = fbData;
  console.log(fbData);
  contract
    .addMessage({ text, id, name })
    .then(() => {
      // Starting refresh animation
      $("#refresh-span").addClass(animateClass);
      // Refreshing the messages in 1 seconds to account for the block creation
      setTimeout(() => {
        refreshMessages();
      }, 1000);
    })
    .catch(console.error);
}
const fbData = {};
function signedInFlow() {
  console.log("signedInFlow");
  // Hiding sign-in html parts and showing post message things
  $("#sign-in-container").addClass("hidden");
  $("#guest-book-container").removeClass("hidden");
  $("#logout-option").removeClass("hidden");

  // Focusing on the enter message field.
  $("#text-message").focus();
  $("#logout-button").click(() => {
    Promise.all([FB.logout(), walletAccount.signOut()]).then((a, b) => {
      // checkLoginState();
      $("#fb-login-button").show();
      $("#near-login-button").show();
      $("#sign-in-container").removeClass("hidden");
      $("#guest-book-container").addClass("hidden");
      $("#logout-option").addClass("hidden");
    });
  });
  // Enablid enter key to send messages as well.
  $("#text-message").keypress(function(e) {
    if (e.which == 13) {
      e.preventDefault();
      submitMessage();
      return false;
    }
  });
  // Post button to send messages
  $("#submit-tx-button").click(submitMessage);
}

// Initialization code
async function init() {
  console.log("nearConfig", nearConfig);

  // Initializing connection to the NEAR DevNet.
  window.near = await nearlib.connect(
    Object.assign(
      {
        deps: { keyStore: new nearlib.keyStores.BrowserLocalStorageKeyStore() }
      },
      nearConfig
    )
  );
  window.walletAccount = new nearlib.WalletAccount(window.near);
  contract = await near.loadContract(nearConfig.contractName, {
    viewMethods: ["getMessages", "getRangeMessages"],
    changeMethods: ["addMessage"],
    sender: walletAccount.getAccountId()
  });

  // contract = new nearlib.Contract(
  //   near.account(walletAccount.getAccountId()),
  //   nearConfig.contractName,
  //   {
  //     viewMethods: ["getMessages", "getPrevMessages", "getNextMessages"],
  //     changeMethods: ["addMessage"]
  //   }
  // );
  console.log(contract, walletAccount);
  $("a.wallet")
    .removeClass("disabled")
    .attr("href", nearConfig.walletUrl);
  // $("#messages").html(loadingHtml);

  $("#refresh-button").click(refreshMessages);
  refreshMessages();

  if (walletAccount.isSignedIn()) {
    $("#near-login-button").hide();
  } else {
    signedOutFlow();
  }
}

function statusChangeCallback(response) {
  // Called with the results from FB.getLoginStatus().
  console.log("statusChangeCallback");
  console.log(response); // The current login status of the person.
  if (response.status === "connected") {
    // signedInFlow();
    facebookSignin();
  } else {
    console.log("not signed in FB");
  }
}

function checkLoginState() {
  // Called when a person is finished with the Login Button.
  FB.getLoginStatus(function(response) {
    // See the onlogin handler
    statusChangeCallback(response);
  });
}

function facebookSignin() {
  FB.api("/me", { fields: ["picture", "name", "email"] }, function({
    name,
    id,
    picture
  }) {
    Object.assign(fbData, { name, id, picture });
    $(".account-id").text(name);
    $("#fb-picture").attr("src", picture.data.url);
    $("#fb-picture").attr("height", picture.data.height);
    $("#fb-login-button").hide();
    if (walletAccount.isSignedIn()) {
      signedInFlow();
    }
  });
}
