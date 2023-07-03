import { Injectable, inject } from '@angular/core';
import { DocumentData, DocumentReference, Firestore, addDoc, collection, collectionData, doc, docSnapshots, getDoc, setDoc } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Group } from 'src/app/models';

@Injectable({
  providedIn: 'root'
})
export class DataProviderService {
  private firestore: Firestore = inject(Firestore)
  private readonly groupCollection = collection(this.firestore, 'groups');

  constructor() { }

  public getGroups(): Observable<any> {
    return collectionData(this.groupCollection);
  }

  public createGroup(): Observable<DocumentReference<DocumentData>> {
    return from(addDoc(this.groupCollection, {}));
  }

  public putGroup(id: string, data?: Partial<Group>): Observable<void> {
    return (from(setDoc(doc(this.groupCollection, id), data, {merge: true})))
  }

  public async patchGroup(data: Group) {
    const group = (await getDoc(doc(this.groupCollection, data.id))).data() as Group;
    group.messages = group?.messages?.concat(data?.messages);
    await (setDoc(doc(this.groupCollection, data.id), group, {merge: true}));
  }

  public getGroup(id: string): Observable<Group> {
    return from(getDoc(doc(this.groupCollection, id))).pipe(map(value => value.data() as Group))
  }

  public listenToGroup(id: string): Observable<{ type?: "learned" | "liked" | "lacked" | "text"; message?: string; }[]> {
    const ref = doc(this.groupCollection, id);
    return docSnapshots(ref).pipe(map(data => (data.data() as Group)?.messages));
  }
}
