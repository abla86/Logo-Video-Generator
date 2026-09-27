import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  setDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Critical: export db with firestoreDatabaseId as required by skill
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error:", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot as mandated by the Firebase skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firebase client is currently offline:", error);
    }
    return false;
  }
}

// Auth helpers
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Sync or init user profile document
    const user = result.user;
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(
      userDocRef,
      {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return user;
  } catch (error) {
    console.error("Google Sign-In failed:", error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

// Helper to save a logo to user's Firestore subcollection
export async function saveUserLogo(userId: string, logo: any): Promise<void> {
  const path = `users/${userId}/logos/${logo.id}`;
  try {
    await setDoc(doc(db, "users", userId, "logos", logo.id), {
      id: logo.id,
      userId,
      companyName: logo.companyName,
      industry: logo.industry || "General",
      style: logo.style || "Modern",
      colorPalette: logo.colorPalette || "Custom",
      promptUsed: logo.promptUsed || "",
      imageUrl: logo.imageUrl,
      imageSize: logo.imageSize || "1K",
      createdAt: logo.createdAt || new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Helper to load user's logos
export async function loadUserLogos(userId: string): Promise<any[]> {
  const path = `users/${userId}/logos`;
  try {
    const snapshot = await getDocs(collection(db, "users", userId, "logos"));
    return snapshot.docs.map((d) => d.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Helper to delete user's logo
export async function deleteUserLogo(userId: string, logoId: string): Promise<void> {
  const path = `users/${userId}/logos/${logoId}`;
  try {
    await deleteDoc(doc(db, "users", userId, "logos", logoId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// StudioProject CRUD helpers for full persistence across sessions
export async function saveUserStudioProject(userId: string, projectData: {
  id: string;
  name: string;
  productOrService?: string;
  companyName?: string;
  industry?: string;
  brandLogoUrl?: string;
  renderedVideoUrl?: string;
  projectJson: string;
  createdAt?: string;
  updatedAt?: string;
}): Promise<void> {
  const path = `users/${userId}/projects/${projectData.id}`;
  try {
    await setDoc(doc(db, "users", userId, "projects", projectData.id), {
      id: projectData.id,
      userId,
      name: projectData.name,
      productOrService: projectData.productOrService || "",
      companyName: projectData.companyName || "",
      industry: projectData.industry || "",
      brandLogoUrl: projectData.brandLogoUrl || "",
      renderedVideoUrl: projectData.renderedVideoUrl || "",
      projectJson: projectData.projectJson,
      createdAt: projectData.createdAt || new Date().toISOString(),
      updatedAt: projectData.updatedAt || new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadUserStudioProjects(userId: string): Promise<any[]> {
  const path = `users/${userId}/projects`;
  try {
    const snapshot = await getDocs(collection(db, "users", userId, "projects"));
    return snapshot.docs.map((d) => d.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function deleteUserStudioProject(userId: string, projectId: string): Promise<void> {
  const path = `users/${userId}/projects/${projectId}`;
  try {
    await deleteDoc(doc(db, "users", userId, "projects", projectId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

