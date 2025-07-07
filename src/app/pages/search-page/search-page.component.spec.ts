import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchPageComponent } from './search-page.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { SpotifyApiService } from '../../services/spotify-api/spotify-api.service';

describe('SearchPageComponent', () => {
  let component: SearchPageComponent;
  let fixture: ComponentFixture<SearchPageComponent>;

  const mockSearchResults = {
    albums: { items: [{ id: '1', name: 'Album', artists: [{ name: 'Artist' }], images: [], type: 'album' }] },
    artists: { items: [{ id: '2', name: 'Artist', images: [], type: 'artist' }] },
    playlists: { items: [{ id: '3', name: 'Playlist', images: [], type: 'playlist' }] },
    tracks: { items: [{ id: '4', name: 'Track', artists: [{ name: 'Artist' }], album: { name: 'Album', images: [] }, type: 'track' }] }
  };

  const mockActivatedRoute = {
    paramMap: of({ get: (key: string) => (key === 'query' ? 'test' : null) })
  };

  const mockSpotifyApiService = {
    search: jest.fn((query: string, callback: (results: any) => void) => {
      callback(mockSearchResults);
    })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchPageComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: SpotifyApiService, useValue: mockSpotifyApiService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate albums, artists, playlists, and tracks on search', () => {
    expect(mockSpotifyApiService.search).toHaveBeenCalledWith('test', expect.any(Function));

    expect(component.albums.length).toBe(1);
    expect(component.artists.length).toBe(1);
    expect(component.playlists.length).toBe(1);
    expect(component.tracks.length).toBe(1);

    expect(component.albums[0].name).toBe('Album');
    expect(component.tracks[0].artists).toBe('Artist');
  });

  it('should unsubscribe on destroy', () => {
    const unsubscribeSpy = jest.spyOn(component['routeSub'], 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
