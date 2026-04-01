import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
apiKey: "AIzaSyAuzwhmjaHvNAwCGVEUK4qBEFxjNdRAq2A",
  authDomain: "myfirstreact-7c215.firebaseapp.com",
  projectId: "myfirstreact-7c215",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // [cite: 263, 264, 265, 270, 271]