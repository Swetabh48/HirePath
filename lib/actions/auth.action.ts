'use server';

import { auth, db } from "@/firebase/admin";
import { User } from "firebase/auth";
import { cookies } from "next/headers";



export async function signUp(params:SignUpParams){
    const {uid,name,email}=params;
    try{
        const userRecord=await db.collection('users').doc(uid).get();
        if(userRecord.exists){
            return {
                success:false,
                message:'User already exists with this email.Please sign in instead.',
            }
        }

        await db.collection('users').doc(uid).set({
            name,email
        })

        return {
            success:true,
            message:'User created successfully.',
        }
    }catch(e:any){
        console.log('Error creating a user',e);

        if(e.code==='auth/email-already-in-use'){
            throw new Error('Email already in use');
        }
        
        return {
            success:false,
            message:'Failed to create an account. Please try again later.',
        }
    }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord)
      return {
        success: false,
        message: "User does not exist. Create an account.",
      };

    await setSessionCookie(idToken);
  } catch (e) {
    console.log(e);

    return {
      success: false,
      message: "Failed to log into account. Please try again.",
    };
  }
}


export async function setSessionCookie(idToken:string){
    const cookieStore=await cookies();
    const sessionCookie=await auth.createSessionCookie(idToken,{
        expiresIn:60 * 60 * 24 * 7*1000,// 1 week
    })

    cookieStore.set('session', sessionCookie, {
        maxAge: 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        path: '/',
        sameSite: 'lax', // Adjust as needed
    })
}


export async function getCurrentUser():Promise<User | null> {
    const cookieStore=await cookies();

    const sessionCookie=cookieStore.get('session')?.value;

    if(!sessionCookie) return null;

    try{
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        const userRecord = await db.collection('users').doc(decodedClaims.uid).get();

        if(!userRecord.exists) {
            return null; // User does not exist in Firestore
        }

        return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;

    }catch(e){
        console.log(e);

        return null;
    }
}


export async function isAuthenticated()
{
    const user=await getCurrentUser();
    return !!user;    
}

export async function getInterviewByUserId(userId:string):Promise<Interview[] | null> {
    const interviews =await db
        .collection('interviews')
        .where('userId','==',userId)
        .orderBy('createdAt','desc')
        .get();

        return interviews.docs.map((doc)=>({
            id: doc.id,
            ...doc.data()
        })) as Interview[];
}


export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}