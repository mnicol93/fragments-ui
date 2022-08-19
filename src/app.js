import { Auth, getUser } from './auth';
import { getUserFragments, postFragment } from './api';

async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  // Action to be performed on the Fragment (Get, Create, Delete)
  const fragmentAction = document.querySelector('.fragment-action');
  // List of current Fragments (Get, Delete)
  const fragmentList = document.querySelector('.select-fragment');
  // Form to create a new Fragment
  const fragmentForm = document.querySelector('.create-fragment-form');
  // DIV containing fragment manipulation. Add HTML programmatically if user is logged in
  const divFragmentForm = document.querySelector('.form');
  // File uploader
  const fileUpload = document.querySelector('#file-upload-input');
  // Content-type selected
  const typeUpload = document.querySelector('#content-type-form');

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
    Auth.federatedSignIn();
  };
  logoutBtn.onclick = () => {
    // Sign-out of the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#sign-out
    Auth.signOut();
  };
  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    return;
  }else{
    divFragmentForm.hidden=false;
  }
  
  // Log the user info for debugging purposes
  console.log({ user });
  //let results = await getUserFragments(user, 1);
  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;

    // Every time an item is selected from the list, function will trigger with
  // event holding properties of the change (i.e, selected value)
  fragmentAction.onchange = async (event) => {
    if(event.target.value === ''){
      fragmentList.hidden=true;
      fragmentForm.hidden=true;
    }else if(event.target.value == 'create'){
      // Hide List, we are creating a new Fragment
      fragmentList.hidden=true;
      fragmentForm.hidden=false;
    }else{
      // Show List
      fragmentList.hidden=false;
      fragmentForm.hidden=true;
      if(event.target.value == 'get'){
        await getUserFragments(user, 1);
      }
    }
  }
  fileUpload.addEventListener('change', handleChange);
  function handleChange(event){
    const uploadedFiles = event.target.files;
    let file = uploadedFiles[0];
    let fileNames = uploadedFiles[0].name;
    let typesNonMatching="";

    //Populate array with filenames for user to confirm and show message
    for(i=1; i < uploadedFiles.length; i++){
      fileNames += ", " + uploadedFiles[i].name;
    }
    let fragment;

    const reader = new FileReader();

    if(!confirm(
        "Files uploaded:\n" + fileNames + "\nType: " + typeUpload.value
        + "\nWould you like to proceed?"
      )){
      console.log("Uploaded cancelled, please upload new files.")
      return;
    }

    reader.onload = (function() {
      return async function(event){
        console.log("Attempting to POST... Wait please");
        try{
          fragment = await postFragment(user, event.target.result, file.type)
        }catch(err){
          console.log(err)
        }
      }
    })(file);
    reader.readAsArrayBuffer(file);

    // Inform the user if some of the files weren't a type-match.
    if(typesNonMatching.length > 0){
      alert('The following files could not be uploaded, TYPE NOT MATCHING:\n' + typesNonMatching);
    }
  }

  // Do an authenticated req to the fragments API server and log the result
  let results = getUserFragments(user);
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);