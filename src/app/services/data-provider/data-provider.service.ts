import { Injectable, inject } from '@angular/core';
import { DocumentData, DocumentReference, FieldValue, Firestore, addDoc, arrayUnion, collection, collectionData, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore'
import { Observable, from, map, switchMap, tap } from 'rxjs';
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

  public patchGroup(data: Group) {
    return from(updateDoc(doc(this.groupCollection, data.id), {messages: arrayUnion(data.messages[0])}))
  }

  public getGroup(id: string): Observable<Group> {
    return from(getDoc(doc(this.groupCollection, id))).pipe(map(value => value.data() as Group))
  }
}
