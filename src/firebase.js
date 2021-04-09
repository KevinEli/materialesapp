import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';

var firebaseConfig = {
    apiKey: "AIzaSyCyCf7wES-wuLgAWq4esT_k56dBgvAxMbY",
    authDomain: "materiales-app.firebaseapp.com",
    databaseURL: "https://materiales-app-default-rtdb.firebaseio.com",
    projectId: "materiales-app",
    storageBucket: "materiales-app.appspot.com",
    messagingSenderId: "58712833390",
    appId: "1:58712833390:web:2a8739b26e95c6a64c157f"
  };

   // Initialize Firebase
   var fireDB=firebase.initializeApp(firebaseConfig);
   const fireDefault = fireDB.database().ref();
   const fireAuth = fireDB.auth();

   export {fireDefault, fireAuth};
   //export default fireDB.database().ref();
