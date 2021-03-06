import { Component, OnInit } from '@angular/core';
import { Modal, NavController, ViewController, LoadingController, NavParams } from 'ionic-angular';
import {FORM_DIRECTIVES, FormBuilder, FormGroup, Validators, AbstractControl} from '@angular/forms';

import { IComment, IUser } from '../../shared/interfaces';
import { AuthService } from '../../shared/services/auth.service';
import { DataService } from '../../shared/services/data.service';

@Component({
  templateUrl: 'build/pages/comment-create/comment-create.html',
  directives: [FORM_DIRECTIVES]
})
export class CommentCreatePage implements OnInit {

  createCommentForm: FormGroup;
  comment: AbstractControl;
  threadKey: string;
  loaded: boolean = false;

  constructor(private nav: NavController,
    private navParams: NavParams,
    private loadingCtrl: LoadingController,
    private viewCtrl: ViewController,
    private fb: FormBuilder,
    private authService: AuthService,
    private dataService: DataService) {

  }

  ngOnInit() {
    this.threadKey = this.navParams.get('threadKey');

    this.createCommentForm = this.fb.group({
      'comment': ['', Validators.compose([Validators.required, Validators.minLength(10)])]
    });

    this.comment = this.createCommentForm.controls['comment'];
    this.loaded = true;
  }

  cancelNewComment() {
    this.viewCtrl.dismiss();
  }

  onSubmit(commentForm: any): void {
    var self = this;
    if (this.createCommentForm.valid) {

      let loader = this.loadingCtrl.create({
        content: 'Posting comment...',
        dismissOnPageChange: true
      });

      loader.present();

      let uid = self.authService.getLoggedInUser().uid;
      self.dataService.getUsername(uid).then(function (snapshot) {
        let username = snapshot.val();

        let commentRef = self.dataService.getCommentsRef().push();
        let commentkey: string = commentRef.key;
        let user: IUser = { uid: uid, username: username };

        let newComment: IComment = {
          key: commentkey,
          text: commentForm.comment,
          thread: self.threadKey,
          user: user,
          dateCreated: new Date().toString(),
          votesUp: null,
          votesDown: null
        };

        self.dataService.submitComment(self.threadKey, newComment)
          .then(function (snapshot) {
            loader.dismiss()
              .then(() => {
                self.viewCtrl.dismiss({
                  comment: newComment,
                  user: user
                });
              });
          }, function (error) {
            // The Promise was rejected.
            console.error(error);
            loader.dismiss();
          });
      });
    }
  }
}
