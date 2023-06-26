import { Injectable, inject } from '@angular/core';
import { DocumentData, DocumentReference, Firestore, addDoc, collection, collectionData, doc, setDoc, updateDoc } from '@angular/fire/firestore'
import { Observable, from, switchMap, tap } from 'rxjs';
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

  public updateGroup(id: string, data?: Partial<Group>): Observable<void> {
    return (from(setDoc(doc(this.groupCollection, id), data, {merge: true})))
  }
}
