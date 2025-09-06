import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

// Acts operations
export const addAct = async (actData) => {
  try {
    const docRef = await addDoc(collection(db, 'acts'), {
      ...actData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding act:', error);
    throw error;
  }
};

export const updateAct = async (id, actData) => {
  try {
    await updateDoc(doc(db, 'acts', id), {
      ...actData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating act:', error);
    throw error;
  }
};

export const getAllActs = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'acts'), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting acts:', error);
    throw error;
  }
};

export const getAct = async (id) => {
  try {
    const docSnap = await getDoc(doc(db, 'acts', id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Act not found');
    }
  } catch (error) {
    console.error('Error getting act:', error);
    throw error;
  }
};

export const deleteAct = async (id) => {
  try {
    await deleteDoc(doc(db, 'acts', id));
  } catch (error) {
    console.error('Error deleting act:', error);
    throw error;
  }
};

// News operations
export const addNews = async (newsData) => {
  try {
    const docRef = await addDoc(collection(db, 'news'), {
      ...newsData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding news:', error);
    throw error;
  }
};

export const updateNews = async (id, newsData) => {
  try {
    await updateDoc(doc(db, 'news', id), {
      ...newsData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating news:', error);
    throw error;
  }
};

export const getAllNews = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'news'), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting news:', error);
    throw error;
  }
};

export const getNews = async (id) => {
  try {
    const docSnap = await getDoc(doc(db, 'news', id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('News not found');
    }
  } catch (error) {
    console.error('Error getting news:', error);
    throw error;
  }
};

export const deleteNews = async (id) => {
  try {
    await deleteDoc(doc(db, 'news', id));
  } catch (error) {
    console.error('Error deleting news:', error);
    throw error;
  }
};

// File upload
export const uploadFile = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};