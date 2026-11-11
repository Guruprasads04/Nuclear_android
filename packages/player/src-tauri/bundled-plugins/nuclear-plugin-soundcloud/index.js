var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../../Users/SGurupr/AppData/Local/Temp/claude/71cfdc44039f2be1/f84dce20-3f33-471c-8930-390f3f13d3d3/scratchpad/sc-plugin/extracted/src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);

// ../../Users/SGurupr/AppData/Local/Temp/claude/71cfdc44039f2be1/f84dce20-3f33-471c-8930-390f3f13d3d3/scratchpad/sc-plugin/extracted/src/config.ts
var METADATA_PROVIDER_ID = "soundcloud";
var STREAMING_PROVIDER_ID = "soundcloud-stream";
var PLAYLIST_PROVIDER_ID = "soundcloud-playlists";
var DEFAULT_SEARCH_LIMIT = 15;
var STREAMING_SEARCH_LIMIT = 5;
var SOUNDCLOUD_URL = "https://soundcloud.com";
var SOUNDCLOUD_API_V2 = "https://api-v2.soundcloud.com";
var CLIENT_ID_REGEX = /[{,]client_id:"(\w+)"/;
var SOUNDCLOUD_PLAYLIST_URL_REGEX = /^https?:\/\/(www\.)?soundcloud\.com\/[\w-]+\/sets\/[\w-]+/;
var SNDCDN_SCRIPT_URL_REGEX = /https?:\/\/[^\s"]*sndcdn\.com[^\s"]*\.js/g;
var ARTWORK_LARGE_SUFFIX = "-t500x500";
var ARTWORK_THUMBNAIL_SUFFIX = "-t200x200";

// ../../Users/SGurupr/AppData/Local/Temp/claude/71cfdc44039f2be1/f84dce20-3f33-471c-8930-390f3f13d3d3/scratchpad/sc-plugin/extracted/src/client-id.ts
var cachedClientId = null;
var getClientId = async (fetchFn, forceRefresh = false) => {
  if (cachedClientId && !forceRefresh) {
    return cachedClientId;
  }
  const homepageResponse = await fetchFn(SOUNDCLOUD_URL);
  if (!homepageResponse.ok) {
    throw new Error(
      `Failed to fetch SoundCloud homepage: ${homepageResponse.status}`
    );
  }
  const html = await homepageResponse.text();
  const scriptUrls = html.match(SNDCDN_SCRIPT_URL_REGEX);
  if (!scriptUrls) {
    throw new Error("No sndcdn script URLs found on SoundCloud homepage");
  }
  const reversedScriptUrls = [...scriptUrls].reverse();
  for (const scriptUrl of reversedScriptUrls) {
    const scriptResponse = await fetchFn(scriptUrl);
    if (!scriptResponse.ok) {
      continue;
    }
    const scriptBody = await scriptResponse.text();
    const match = scriptBody.match(CLIENT_ID_REGEX);
    if (match?.[1]) {
      cachedClientId = match[1];
      return match[1];
    }
  }
  throw new Error("Could not extract client_id from SoundCloud JS bundles");
};
var clearCachedClientId = () => {
  cachedClientId = null;
};

// ../../Users/SGurupr/AppData/Local/Temp/claude/71cfdc44039f2be1/f84dce20-3f33-471c-8930-390f3f13d3d3/scratchpad/sc-plugin/extracted/src/api.ts
var apiRequest = async (fetchFn, endpoint, params = {}) => {
  const clientId = await getClientId(fetchFn);
  const searchParams = new URLSearchParams({
    ...params,
    client_id: clientId
  });
  const url = `${SOUNDCLOUD_API_V2}/${endpoint}?${searchParams.toString()}`;
  const response = await fetchFn(url);
  if (response.status === 401 || response.status === 403) {
    const refreshedClientId = await getClientId(fetchFn, true);
    const retryParams = new URLSearchParams({
      ...params,
      client_id: refreshedClientId
    });
    const retryUrl = `${SOUNDCLOUD_API_V2}/${endpoint}?${retryParams.toString()}`;
    const retryResponse = await fetchFn(retryUrl);
    if (!retryResponse.ok) {
      throw new Error(
        `SoundCloud API error: ${retryResponse.status} for ${endpoint}`
      );
    }
    return retryResponse.json();
  }
  if (!response.ok) {
    throw new Error(`SoundCloud API error: ${response.status} for ${endpoint}`);
  }
  return response.json();
};
var searchTracks = async (fetchFn, query, limit) => apiRequest(fetchFn, "search/tracks", {
  q: query,
  limit: String(limit)
});
var searchUsers = async (fetchFn, query, limit) => apiRequest(fetchFn, "search/users", {
  q: query,
  limit: String(limit)
});
var getTrack = async (fetchFn, trackId) => apiRequest(fetchFn, `tracks/${trackId}`);
var getUser = async (fetchFn, userId) => apiRequest(fetchFn, `users/${userId}`);
var getUserTracks = async (fetchFn, userId, limit) => apiRequest(fetchFn, `users/${userId}/tracks`, {
  limit: String(limit)
});
var getRelatedUsers = async (fetchFn, userId, limit) => apiRequest(fetchFn, `users/${userId}/relatedartists`, {
  limit: String(limit)
});
var getStreamUrl = async (fetchFn, transcodingUrl) => {
  const clientId = await getClientId(fetchFn);
  const parsedUrl = new URL(transcodingUrl);
  parsedUrl.searchParams.set("client_id", clientId);
  const response = await fetchFn(parsedUrl.toString());
  if (response.status === 401 || response.status === 403) {
    const refreshedClientId = await getClientId(fetchFn, true);
    parsedUrl.searchParams.set("client_id", refreshedClientId);
    const retryResponse = await fetchFn(parsedUrl.toString());
    if (!retryResponse.ok) {
      throw new Error(`Failed to resolve stream URL: ${retryResponse.status}`);
    }
    const data2 = await retryResponse.json();
    return data2.url;
  }
  if (!response.ok) {
    throw new Error(`Failed to resolve stream URL: ${response.status}`);
  }
  const data = await response.json();
  return data.url;
};
var getUserPlaylists = async (fetchFn, userId, limit) => apiRequest(fetchFn, `users/${userId}/playlists`, {
  limit: String(limit)
});
var resolve = async (fetchFn, url) => apiRequest(fetchFn, "resolve", { url });
var getTracks = async (fetchFn, ids) => apiRequest(fetchFn, "tracks", { ids: ids.join(",") });

// ../../Users/SGurupr/AppData/Local/Temp/claude/71cfdc44039f2be1/f84dce20-3f33-471c-8930-390f3f13d3d3/scratchpad/sc-plugin/extracted/src/fetch.ts
var BROWSER_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
var createSoundcloudFetch = (baseFetch) => (input, init) => baseFetch(input, {
  ...init,
  headers: {
    "User-Agent": BROWSER_USER_AGENT,
    Origin: SOUNDCLOUD_URL,
    Referer: `${SOUNDCLOUD_URL}/`,
    Accept: "application/json, text/javascript, */*; q=0.01",
    "Accept-Language": "en-US,en;q=0.9",
    ...init?.headers
  }
});

// ../../Users/SGurupr/AppData/Local/Temp/claude/71cfdc44039f2be1/f84dce20-3f33-471c-8930-390f3f13d3d3/scratchpad/sc-plugin/extracted/src/mappers.ts
var makeSource = (providerId, entity) => ({
  provider: providerId,
  id: String(entity.id),
  url: entity.permalink_url
});
var resizeArtworkUrl = (artworkUrl, suffix) => artworkUrl.replace(/-large(?=\.\w+$)/, suffix);
var makeTrackArtworkSet = (artworkUrl, fallbackUrl) => {
  const url = artworkUrl ?? fallbackUrl;
  if (!url) {
    return void 0;
  }
  return {
    items: [
      {
        url: resizeArtworkUrl(url, ARTWORK_LARGE_SUFFIX),
        width: 500,
        height: 500,
        purpose: "cover"
      },
      {
        url: resizeArtworkUrl(url, ARTWORK_THUMBNAIL_SUFFIX),
        width: 200,
        height: 200,
        purpose: "thumbnail"
      }
    ]
  };
};
var makeAvatarArtworkSet = (avatarUrl) => {
  if (!avatarUrl) {
    return void 0;
  }
  return {
    items: [
      {
        url: resizeArtworkUrl(avatarUrl, ARTWORK_LARGE_SUFFIX),
        width: 500,
        height: 500,
        purpose: "avatar"
      },
      {
        url: resizeArtworkUrl(avatarUrl, ARTWORK_THUMBNAIL_SUFFIX),
        width: 200,
        height: 200,
        purpose: "thumbnail"
      }
    ]
  };
};
var parseQuotedTagList = (tagList) => {
  const tags = tagList.match(/"[^"]+"|[^\s"]+/g)?.map((tag) => tag.replace(/"/g, "").trim()).filter(Boolean);
  return tags && tags.length > 0 ? tags : void 0;
};
var mapTrackToTrack = (track) => {
  const artistName = track.publisher_metadata?.artist ?? track.user.username;
  return {
    title: track.title,
    artists: [
      {
        name: artistName,
        roles: [],
        source: makeSource(METADATA_PROVIDER_ID, track.user)
      }
    ],
    album: track.publisher_metadata?.album_title ? {
      title: track.publisher_metadata.album_title,
      source: makeSource(METADATA_PROVIDER_ID, track)
    } : void 0,
    durationMs: track.full_duration,
    artwork: makeTrackArtworkSet(track.artwork_url, track.user.avatar_url),
    tags: parseQuotedTagList(track.tag_list),
    source: makeSource(METADATA_PROVIDER_ID, track)
  };
};
var mapUserToArtistRef = (user) => ({
  name: user.username,
  artwork: makeAvatarArtworkSet(user.avatar_url),
  source: makeSource(METADATA_PROVIDER_ID, user)
});
var mapUserToArtistSocialStats = (user) => ({
  name: user.username,
  artwork: makeAvatarArtworkSet(user.avatar_url),
  city: user.city ?? void 0,
  country: user.country_code ?? void 0,
  followersCount: user.followers_count,
  followingsCount: user.followings_count,
  trackCount: user.track_count,
  playlistCount: user.playlist_count,
  source: makeSource(METADATA_PROVIDER_ID, user)
});
var mapPlaylistToPlaylistRef = (playlist) => ({
  id: String(playlist.id),
  name: playlist.title,
  artwork: makeTrackArtworkSet(playlist.artwork_url, playlist.user.avatar_url),
  source: makeSource(METADATA_PROVIDER_ID, playlist)
});
var mapTrackToTrackRef = (track) => ({
  title: track.title,
  artists: [
    {
      name: track.publisher_metadata?.artist ?? track.user.username,
      artwork: makeAvatarArtworkSet(track.user.avatar_url),
      source: makeSource(METADATA_PROVIDER_ID, track.user)
    }
  ],
  artwork: makeTrackArtworkSet(track.artwork_url, track.user.avatar_url),
  source: makeSource(METADATA_PROVIDER_ID, track)
});
var mapTrackToStreamCandidate = (track) => ({
  id: String(track.id),
  title: track.title,
  durationMs: track.full_duration,
  thumbnail: track.artwork_url ? resizeArtworkUrl(track.artwork_url, ARTWORK_THUMBNAIL_SUFFIX) : track.user.avatar_url ? resizeArtworkUrl(track.user.avatar_url, ARTWORK_THUMBNAIL_SUFFIX) : void 0,
  failed: false,
  source: makeSource(STREAMING_PROVIDER_ID, track)
});
var mapPlaylistToPlaylist = (playlist, tracks) => ({
  id: String(playlist.id),
  name: playlist.title,
  description: playlist.description ?? void 0,
  artwork: makeTrackArtworkSet(playlist.artwork_url, playlist.user.avatar_url),
  createdAtIso: new Date(playlist.created_at).toISOString(),
  lastModifiedIso: new Date(playlist.last_modified).toISOString(),
  isReadOnly: true,
  origin: makeSource(PLAYLIST_PROVIDER_ID, playlist),
  items: tracks.map((track) => ({
    id: String(track.id),
    track: mapTrackToTrack(track),
    addedAtIso: new Date(playlist.created_at).toISOString()
  }))
});

// ../../Users/SGurupr/AppData/Local/Temp/claude/71cfdc44039f2be1/f84dce20-3f33-471c-8930-390f3f13d3d3/scratchpad/sc-plugin/extracted/src/metadata-provider.ts
var ARTIST_TOP_TRACKS_LIMIT = 10;
var ARTIST_PLAYLISTS_LIMIT = 10;
var RELATED_ARTISTS_LIMIT = 10;
var createMetadataProvider = (api) => {
  const fetch = createSoundcloudFetch(api.Http.fetch);
  return {
    id: METADATA_PROVIDER_ID,
    kind: "metadata",
    name: "SoundCloud",
    streamingProviderId: STREAMING_PROVIDER_ID,
    searchCapabilities: ["artists", "tracks"],
    artistMetadataCapabilities: [
      "artistSocialStats",
      "artistTopTracks",
      "artistPlaylists",
      "artistRelatedArtists"
    ],
    searchArtists: async (params) => {
      const result = await searchUsers(
        fetch,
        params.query,
        params.limit ?? DEFAULT_SEARCH_LIMIT
      );
      return result.collection.map(mapUserToArtistRef);
    },
    searchTracks: async (params) => {
      const result = await searchTracks(
        fetch,
        params.query,
        params.limit ?? DEFAULT_SEARCH_LIMIT
      );
      return result.collection.map(mapTrackToTrack);
    },
    fetchArtistSocialStats: async (artistId) => {
      const userId = Number(artistId);
      const user = await getUser(fetch, userId);
      return mapUserToArtistSocialStats(user);
    },
    fetchArtistTopTracks: async (artistId) => {
      const userId = Number(artistId);
      const result = await getUserTracks(
        fetch,
        userId,
        ARTIST_TOP_TRACKS_LIMIT
      );
      return result.collection.map(mapTrackToTrackRef);
    },
    fetchArtistPlaylists: async (artistId) => {
      const userId = Number(artistId);
      const result = await getUserPlaylists(
        fetch,
        userId,
        ARTIST_PLAYLISTS_LIMIT
      );
      return result.collection.map(mapPlaylistToPlaylistRef);
    },
    fetchArtistRelatedArtists: async (artistId) => {
      const userId = Number(artistId);
      const result = await getRelatedUsers(
        fetch,
        userId,
        RELATED_ARTISTS_LIMIT
      );
      return result.collection.map(mapUserToArtistRef);
    }
  };
};

// ../../Users/SGurupr/AppData/Local/Temp/claude/71cfdc44039f2be1/f84dce20-3f33-471c-8930-390f3f13d3d3/scratchpad/sc-plugin/extracted/src/playlist-provider.ts
var TRACK_BATCH_SIZE = 50;
var isFullTrack = (track) => "title" in track;
var hydratePlaylistTracks = async (fetchFn, playlist) => {
  const fullTracks = [];
  const stubIds = [];
  for (const track of playlist.tracks) {
    if (isFullTrack(track)) {
      fullTracks.push(track);
    } else {
      stubIds.push(track.id);
    }
  }
  if (stubIds.length === 0) {
    return fullTracks;
  }
  const batches = [];
  for (let i = 0; i < stubIds.length; i += TRACK_BATCH_SIZE) {
    batches.push(stubIds.slice(i, i + TRACK_BATCH_SIZE));
  }
  const batchResults = await Promise.all(
    batches.map((batch) => getTracks(fetchFn, batch))
  );
  const hydratedTracks = batchResults.flat();
  const trackMap = /* @__PURE__ */ new Map();
  for (const track of [...fullTracks, ...hydratedTracks]) {
    trackMap.set(track.id, track);
  }
  return playlist.tracks.map((track) => trackMap.get(track.id)).filter((track) => track !== void 0);
};
var createPlaylistProvider = (api) => {
  const fetch = createSoundcloudFetch(api.Http.fetch);
  return {
    id: PLAYLIST_PROVIDER_ID,
    kind: "playlists",
    name: "SoundCloud",
    matchesUrl: (url) => SOUNDCLOUD_PLAYLIST_URL_REGEX.test(url),
    fetchPlaylistByUrl: async (url) => {
      const scPlaylist = await resolve(fetch, url);
      const tracks = await hydratePlaylistTracks(fetch, scPlaylist);
      api.Logger.info(
        `Fetched SoundCloud playlist "${scPlaylist.title}" with ${tracks.length} tracks`
      );
      return mapPlaylistToPlaylist(scPlaylist, tracks);
    }
  };
};

// ../../Users/SGurupr/AppData/Local/Temp/claude/71cfdc44039f2be1/f84dce20-3f33-471c-8930-390f3f13d3d3/scratchpad/sc-plugin/extracted/src/stream.ts
var BITRATE_BY_PRESET = {
  mp3_0_0: 128,
  mp3_0_1: 64,
  mp3_1_0: 128,
  opus_0_0: 64
};
var estimateBitrate = (transcoding) => {
  if (transcoding.preset in BITRATE_BY_PRESET) {
    return BITRATE_BY_PRESET[transcoding.preset];
  }
  if (transcoding.format.mime_type.includes("audio/mp4")) {
    return transcoding.quality === "hq" ? 256 : 160;
  }
  return 128;
};
var findHlsTranscoding = (transcodings) => {
  const hlsAac = transcodings.find(
    (transcoding) => transcoding.format.protocol === "hls" && transcoding.format.mime_type.includes("audio/mp4")
  );
  if (hlsAac) {
    return hlsAac;
  }
  return transcodings.find(
    (transcoding) => transcoding.format.protocol === "hls"
  );
};
var resolveStreamForTrack = async (fetchFn, track) => {
  const transcoding = findHlsTranscoding(track.media.transcodings);
  if (!transcoding) {
    throw new Error(
      `No HLS transcoding found for track: ${track.permalink_url}`
    );
  }
  const hlsUrl = await getStreamUrl(fetchFn, transcoding.url);
  return {
    url: hlsUrl,
    durationMs: track.full_duration,
    mimeType: transcoding.format.mime_type,
    bitrateKbps: estimateBitrate(transcoding)
  };
};

// ../../Users/SGurupr/AppData/Local/Temp/claude/71cfdc44039f2be1/f84dce20-3f33-471c-8930-390f3f13d3d3/scratchpad/sc-plugin/extracted/src/streaming-provider.ts
var createStreamingProvider = (api) => {
  const fetch = createSoundcloudFetch(api.Http.fetch);
  return {
    id: STREAMING_PROVIDER_ID,
    kind: "streaming",
    name: "SoundCloud",
    searchForTrack: async (artist, title) => {
      const query = `${artist} ${title}`;
      const result = await searchTracks(fetch, query, STREAMING_SEARCH_LIMIT);
      return result.collection.map(mapTrackToStreamCandidate);
    },
    getStreamUrl: async (candidateId) => {
      const trackId = Number(candidateId);
      if (Number.isNaN(trackId)) {
        throw new Error(`Invalid SoundCloud track ID: ${candidateId}`);
      }
      const track = await getTrack(fetch, trackId);
      const streamInfo = await resolveStreamForTrack(fetch, track);
      api.Logger.debug(
        `Resolved HLS stream for "${track.title}" by ${track.user.username}`
      );
      return {
        url: streamInfo.url,
        protocol: "hls",
        mimeType: streamInfo.mimeType,
        bitrateKbps: streamInfo.bitrateKbps,
        durationMs: streamInfo.durationMs,
        source: {
          provider: STREAMING_PROVIDER_ID,
          id: candidateId,
          url: track.permalink_url
        }
      };
    }
  };
};

// ../../Users/SGurupr/AppData/Local/Temp/claude/71cfdc44039f2be1/f84dce20-3f33-471c-8930-390f3f13d3d3/scratchpad/sc-plugin/extracted/src/index.ts
var plugin = {
  onEnable(api) {
    api.Providers.register(createMetadataProvider(api));
    api.Providers.register(createStreamingProvider(api));
    api.Providers.register(createPlaylistProvider(api));
  },
  onDisable(api) {
    api.Providers.unregister(METADATA_PROVIDER_ID);
    api.Providers.unregister(STREAMING_PROVIDER_ID);
    api.Providers.unregister(PLAYLIST_PROVIDER_ID);
    clearCachedClientId();
  }
};
var index_default = plugin;
