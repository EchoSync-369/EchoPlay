import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { HomeComponent } from './pages/home/home.component';
import { SpotifyAuthGuard } from './services/auth/spotify-auth.guard';
import { UnauthGuard } from './services/unauth/unauth.guard';

export const routes: Routes = [
  // Redirect to the landing page on base path
  {
    path: "",
    redirectTo: "/landing",
    pathMatch: "full",
  },

  // "Unauthenticated" route for the landing page
  {
    path: "landing",
    component: LandingPageComponent,
    canActivate: [UnauthGuard]
  },

  // "Authenticated" routes
  {
    path: "home",
    component: HomeComponent,
    canActivate: [SpotifyAuthGuard]
  },
];
