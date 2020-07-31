import { Injectable } from '@angular/core';
import { Observable, of, observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, DocumentReference, AngularFirestoreDocument, DocumentSnapshot, DocumentData, Action, DocumentChangeAction } from '@angular/fire/firestore';
import { Router, PRIMARY_OUTLET } from '@angular/router';
import { auth } from 'firebase/app';
import { User } from './models/User';
import { concat } from 'rxjs';
import { map, switchMap, tap, take, filter, timeoutWith } from 'rxjs/operators';
import { Poster } from './models/Poster';
import { Group } from './models/Group';
import { Post } from './models/Post';
import { firestore } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  declineRequest(groupId: string, uid: DocumentReference) {
    let batch = this.afs.firestore.batch();

    let groupDoc = this.afs.doc(`groups/${groupId}`).ref;
    
    batch.update(groupDoc, {
      receivedRequests: firestore.FieldValue.arrayRemove(uid),
    });

    return batch.commit();
  }
  acceptRequest(groupId: string, uid: DocumentReference) {
    let batch = this.afs.firestore.batch();

    let groupDoc = this.afs.doc(`groups/${groupId}`).ref;
    let userDoc = uid;

    batch.update(groupDoc, {
      receivedRequests: firestore.FieldValue.arrayRemove(userDoc),
      members: firestore.FieldValue.arrayUnion(userDoc)
    });
    
    batch.update(userDoc, {
      sentRequests: firestore.FieldValue.arrayUnion(groupDoc),
      roles: firestore.FieldValue.arrayUnion(groupDoc)
    });

    return batch.commit();
  }
  inviteSent(id: any): Observable<boolean> {
    return this.afs.doc(`groups/${id}`).get().pipe(
      map((group) => {
        let reqs = group.data()['receivedRequests'];
        if (reqs) {
          reqs = reqs.map(req => req.id);
          if (reqs && reqs.includes(this.userId)) {
            return true;
          }
        } else return false;
      })
    );
  }
  userId: string;
  groupCollection = this.afs.collection<Group>('/groups');

  constructor(private auth: AngularFireAuth, 
              private afs: AngularFirestore,
              private router: Router) {
    this.auth.authState.subscribe(user => {
      if(user) {
        let batch = this.afs.firestore.batch();
        this.userId = user.uid;
        let userDoc = this.afs.collection(`users`).doc(this.userId);
        userDoc.snapshotChanges().subscribe((docSnapshot) => {
          if (!docSnapshot.payload.exists) {
            batch.set(userDoc.ref, {uid: this.userId});
          }
          if (!docSnapshot.payload.data()['roles']) {
            batch.update(userDoc.ref, {roles: [userDoc.ref]});
          } 
          if (!docSnapshot.payload.data()['name'] || docSnapshot.payload.data()['name'] == 'isyanqar47') {
            this.router.navigateByUrl('/name');
          }
          if (!docSnapshot.payload.data()['posts']) {
            batch.update(userDoc.ref, {posts: []});
          }
          batch.commit();
        });
      }
    });
    
   }
  
  isUserInGroup(groupId: string): Observable<boolean> {
    return this.afs.doc<Group>(`groups/${groupId}`).get().pipe(
      map(groupDoc => groupDoc.data().members),
      map(members => members.map(member => member.id)),
      map(members => members.includes(this.userId))
    );
  }

  get(docId: string, field: string): Observable<any> {
    return this.afs.doc(docId).get().pipe(
      map((docRef) => docRef.data()[field])
    );
  }

  isGroupNameUnique(name: string): Observable<boolean> {
    return this.afs.collection('groups', ref => ref.where("name", "==", name))
    .get().pipe(
      map((groupsRef) => !(groupsRef && groupsRef.size > 0))
    );
  }

  isNameUnique(name: string):  Observable<boolean>{
    return this.afs.collection('users', ref => ref.where("name", "==", name))
    .get().pipe(
      map((usersRef) => !(usersRef && usersRef.size > 0))
    );
  }

  updateName(name_: String) {
    this.afs.doc(`users/${this.userId}`).update({name: name_});
    this.router.navigateByUrl('');
  }
  updateUser(new_value: any, field: string) {
    this.afs.doc(`users/${this.userId}`).update({[field]: new_value});
  }

  updateGroup(groupId: string, new_value: any, field: string) {
    this.afs.doc(`groups/${groupId}`).update({[field]: new_value});
  }

  getRoles(): Observable<DocumentReference[]> {
    // return an observable of strings
    let user = this.afs.doc(`users/${this.userId}`).valueChanges();
    let obs = user.pipe(map(userEach => userEach['roles']));
    return obs;
  }

  getRolesOf(userId: string): Observable<DocumentReference[] | null> {
    let user = this.afs.doc(`users/${userId}`).valueChanges();
    let obs = user.pipe(map<Document, DocumentReference[]>(userEach => userEach['roles']));
    return obs;
  }
  getUserByName(userName: string): Observable<any> {
    return this.getDocByUrl(`users/${userName}`);
  }
  getDoc(docId: string): Observable<Action<DocumentSnapshot<any>>> {
    return this.afs.doc(docId).snapshotChanges();
  }
  getDocByUrl(docUrl: string): Observable<any> {
    const tree = this.router.parseUrl(docUrl).root.children[PRIMARY_OUTLET];
    const posterType = tree.segments[0].toString();
    const name = decodeURIComponent(tree.segments[1].toString());
    return this.afs.collection(posterType, ref => ref.where('name', '==', name).limit(1)).snapshotChanges().pipe(
      filter(ref => {return ref[0] != null}),
      map(ref => {
        return ref[0] ? {id: ref[0].payload.doc.id, data: ref[0].payload.doc.data()} : null;
      })
    );
  }
  navigateToProfile() {
    this.afs.doc(`users/${this.userId}`).get().subscribe((user) => {
      this.router.navigateByUrl(`/users/${user.data().name}`);
    });
  }
  getGroupsOf(userId: string) {
    let arr = [];
    let returningObs = new Observable((observer) => {
      this.getRolesOf(userId).subscribe((roleRefs) => {
          if (arr.length > 0) arr = [];
          roleRefs.forEach((roleRef) => {
            roleRef.get().then((snap) => {
              if (snap.id != this.userId) {
                arr.push(snap.data()['name']);
              }
            })
          });
        })
      observer.next(arr);
    });
    
    return returningObs;
  }
  getGroups() {
    let arr = [];
    let returningObs = new Observable((observer) => {
      this.getRoles().subscribe((roleRefs) => {
        arr = [];
          roleRefs.forEach((roleRef) => {
            roleRef.get().then((snap) => {
              if (snap.id != this.userId) {
                arr.push(snap.data()['name']);
              }
            })
          });
        })
      observer.next(arr);
    });
    
    return returningObs;
  }

  getRoleNames() {
    let arr = [];
    let returningObs = new Observable((observer) => {
      this.getRoles().subscribe((roleRefs) => {
          roleRefs.forEach((roleRef) => {
            roleRef.get().then((snap) => {
              arr.push([roleRef.path, snap.data()['name']]);
            })
          });
        })
      observer.next(arr);
    });
    
    return returningObs;
  }

  addPostToPoster(postRef: DocumentReference, poster: DocumentReference) {
    const posterRef = this.afs.doc(poster);

    let postsList = [];
    posterRef.get().subscribe((poster) => {
      postsList = poster.data().posts;
      postsList.push(postRef);
      posterRef.update({posts: postsList});
    });

    

  }

  async addGroup(name: string) {
    const userRef = this.afs.doc(`users/${this.userId}`);
    
    const data: Group = {
      name: name,
      members: [userRef.ref],
      posts: []
    }
    let rolesList = [];
    
    userRef.get().subscribe((user) => {
      rolesList = user.data().roles;
    });

    await this.groupCollection.add(data).then((role) => {
      rolesList.push(role);
    });
    userRef.update({roles: rolesList});

  }

  getPoster(post: Post): Observable<String> {
    return new Observable<String>(obs => {
      obs.next(post.on_behalf_of.toString());
    });
  }
  
  sendInvite(groupId) {
    this.afs.doc(`groups/${groupId}`).update({
      receivedRequests: firestore.FieldValue.arrayUnion(this.afs.doc(`users/${this.userId}`).ref)
    });
    this.afs.doc(`users/${this.userId}`).update({
      sentRequests: firestore.FieldValue.arrayUnion(this.afs.doc(`groups/${groupId}`).ref)
    });
  }
  async login() {
    try {
      await this.auth.signInWithPopup(new auth.GoogleAuthProvider());
    } catch (error) {}
    return this.router.navigateByUrl('/'); 
  }
  
  async logout() {
    this.userId = null;
    await this.auth.signOut();
  }
}
