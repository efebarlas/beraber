import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ChangeDetectorRef } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire';
import { HomeComponent } from './home/home.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ComposeComponent } from './compose/compose.component';
import { CreateGroupComponent } from './create-group/create-group.component';
import { SetnameComponent } from './setname/setname.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { GroupProfileComponent } from './group-profile/group-profile.component';
import { EditComponent } from './edit/edit.component';
import { EditGroupComponent } from './edit-group/edit-group.component';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { DisplayComponent } from './display/display.component';
import { GroupDisplayComponent } from './group-display/group-display.component';
import { PostsDisplayComponent } from './posts-display/posts-display.component';
import { EditUsernameComponent } from './edit-username/edit-username.component';
import { DisplayUsernameComponent } from './display-username/display-username.component';
import { DisplayGroupNameComponent } from './display-group-name/display-group-name.component';
import { DisplayGroupFieldComponent } from './display-group-field/display-group-field.component';
import { DisplayMembersComponent } from './display-members/display-members.component';
import { EditGroupNameComponent } from './edit-group-name/edit-group-name.component';
import { MatCardModule } from '@angular/material/card';
import { ClickOutsideDirective } from './click-outside-directive';
import { ReceivedInvitesComponent } from './received-invites/received-invites.component';
import { DisplaySkillsComponent } from './display-skills/display-skills.component';
import { DisplayLocationComponent } from './display-location/display-location.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    ComposeComponent,
    CreateGroupComponent,
    SetnameComponent,
    UserProfileComponent,
    GroupProfileComponent,
    EditComponent,
    EditGroupComponent,
    DisplayComponent,
    GroupDisplayComponent,
    PostsDisplayComponent,
    EditUsernameComponent,
    DisplayUsernameComponent,
    DisplayGroupNameComponent,
    DisplayGroupFieldComponent,
    DisplayMembersComponent,
    EditGroupNameComponent,
    ClickOutsideDirective,
    ReceivedInvitesComponent,
    DisplaySkillsComponent,
    DisplayLocationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ScrollingModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireFunctionsModule,
    MatCardModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
