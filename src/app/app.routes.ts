import { Routes } from "@angular/router";
import { LandingPageComponent } from "./pages/landing-page/landing-page.component";
import { HomeComponent } from "./pages/home/home.component";
import { SpotifyAuthGuard } from "./services/auth/spotify-auth.guard";
import { UnauthGuard } from "./services/unauth/unauth.guard";
import { SearchPageComponent } from "./pages/search-page/search-page.component";
import { PlayerPageComponent } from "./pages/player-page/player-page.component";

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
    canActivate: [UnauthGuard],
    data: { showSearchBar: false },
  },

  // "Authenticated" routes
  {
    path: "home",
    component: HomeComponent,
    canActivate: [SpotifyAuthGuard],
    data: { showSearchBar: true },
  },
  {
    path: "search/:query",
    component: SearchPageComponent,
    canActivate: [SpotifyAuthGuard],
    data: { showSearchBar: true },
  },
  {
    path: "player/:type/:id",
    component: PlayerPageComponent,
    canActivate: [SpotifyAuthGuard],
    data: { showSearchBar: true },
  },

  // Fallback route for any unmatched paths
  {
    path: "**",
    redirectTo: "/landing",
  },
];
