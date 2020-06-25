import { Component, OnInit, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { Post } from '../models/Post';
import { Poster } from '../models/Poster';
import { Group } from '../models/Group';
import { User } from '../models/User';
import { AngularFirestore, DocumentReference, AngularFirestoreDocument } from '@angular/fire/firestore';
import { UserService } from '../user.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-compose',
  templateUrl: './compose.component.html',
  styleUrls: ['./compose.component.scss']
})
export class ComposeComponent implements OnInit {
  @Input() userId: string;
  
  @Input() post_text: string;
  @Input() on_behalf: DocumentReference;

  private wasInside = true;
  @Output() onClose: EventEmitter<boolean> = new EventEmitter();

  roles: Observable<unknown>;
  roleNames: Observable<unknown>;
  constructor(private userSvc: UserService, private afs: AngularFirestore) { }

  postCollection = this.afs.collection<Post>('/posts');

  @HostListener('click') clickInside() {
    this.wasInside = !this.wasInside;
  }

  @HostListener('document:click') clickOutside() {
    if (!this.wasInside) {
      this.onClose.emit(true);

    }
    this.wasInside = false;
  }

  add_post() {
    let date = new Date();
    this.postCollection.add({
      text: this.post_text,
      on_behalf_of: this.afs.doc(this.on_behalf).ref,
      date: date
    }).then((post) => {
      this.userSvc.addPostToPoster(post, this.on_behalf);
      this.onClose.emit(true);
    });
  }
  ngOnInit(): void {
    this.roles = this.userSvc.getRoles();
    this.roleNames = this.userSvc.getRoleNames();
  }

}