import { Injectable } from "@angular/core"

@Injectable({
  providedIn: 'root'
})
export class PlaybackService {
  private player: any;

  initializePlayer(token: string) {
    (window as any).onSpotifyWebPlaybackSDKReady = () => {
      this.player = new (window as any).Spotify.Player({
        name: 'EchoPlay',
        getOAuthToken: (cb: any) => cb(token),
        volume: 0.5
      });

      this.player.connect();
    };
  }

  play(uri: string) {
    this.player.resume();
  }

  pause() {
    this.player.pause();
  }
}